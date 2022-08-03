import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy, last } from 'lodash';
import { DateTime } from 'luxon';
import { Observable, Subscriber } from 'rxjs';
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  DescribeLogStreamsCommand,
  DeleteLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

/**
 * A basic class for spying on EventBridge events.
 */
export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  subscribers: Subscriber<EventBridgeEvent<string, unknown>[]>[] = [];
  observable: Observable<EventBridgeEvent<string, unknown>[]>;
  done = false;

  constructor() {
    // create observable
    this.observable = new Observable((subscriber) => {
      this.subscribers.push(subscriber);
      // when we are done, new susbcribers immediately resolve
      if (!this.done) {
        subscriber.next(this.events);
      } else {
        subscriber.complete();
      }
    });
  }

  clear(): void {
    this.events = [];
  }

  async stopPoller() {}

  async reset(): Promise<void> {
    await this.stopPoller();
    this.clear();
  }

  async pollEvents(): Promise<void> {
    throw new Error('Not implemented. Implement this in a child class.');
  }

  awaitEvents(
    matcher: EventMatcher,
  ): Promise<EventBridgeEvent<string, unknown>[]> {
    return new Promise<EventBridgeEvent<string, unknown>[]>((resolve) => {
      this.observable.subscribe({
        next: (events) => {
          if (matcher(events)) {
            resolve(events);
          }
        },
        complete: () => {
          resolve(this.events);
        },
      });
    });
  }
}

type CloudWatchEventSpyParams = {
  logGroupName: string;
  interval?: number;
  timeout?: number;
};

type FilterLogEventsResult = {
  events: EventBridgeEvent<string, unknown>[];
  nextToken?: string;
};

/**
 * An implementation of the EventBdridgeSpy, using CloudWatch logs as
 * an event subscriber.
 * */
export class CloudWatchLogsEventBridgeSpy extends EventBridgeSpy {
  intervalTimer: ReturnType<typeof setInterval> | undefined;
  timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  startTime: number;
  interval: number;
  timeout: number;
  nextToken?: string;
  logGroupName: string;
  cloudWatchLogs: CloudWatchLogsClient;

  constructor(params: CloudWatchEventSpyParams) {
    super();
    const { logGroupName, interval = 2000, timeout = 10000 } = params;

    this.cloudWatchLogs = new CloudWatchLogsClient({});
    this.logGroupName = logGroupName;
    this.startTime = Date.now() - 30000;
    this.interval = interval;
    this.timeout = timeout;
  }

  async pollEvents(): Promise<void> {
    // start polling events
    this.intervalTimer = setInterval(async () => {
      const startTime = this.startTime;
      const { events, nextToken: newNextToken } = await this.filterLogEvents({
        logGroupName: this.logGroupName,
        startTime,
        nextToken: this.nextToken,
      });
      this.nextToken = newNextToken;
      this.events = uniqBy([...this.events, ...events], 'id');
      const lastTime = last(this.events)?.time;
      // use the last event's time, but only if there is no nextToken
      this.startTime =
        lastTime && !newNextToken
          ? DateTime.fromISO(lastTime).toMillis()
          : startTime;
      this.subscribers.forEach((subscriber) => subscriber.next(events));
    }, this.interval);
    // stop after timeout
    this.timeoutTimer = setTimeout(() => {
      this.intervalTimer && clearInterval(this.intervalTimer);
      this.subscribers.forEach((subscriber) => subscriber.complete());
      this.done = true;
    }, this.timeout);
  }

  async stopPoller() {
    this.timeoutTimer && clearTimeout(this.timeoutTimer);
    this.intervalTimer && clearInterval(this.intervalTimer);
    this.subscribers.forEach((subscriber) => subscriber.complete());
    await this.deleteAllLogs(this.logGroupName);
  }

  async filterLogEvents(params: {
    logGroupName: string;
    startTime?: number;
    nextToken?: string;
  }): Promise<FilterLogEventsResult> {
    const { startTime, nextToken, logGroupName } = params;
    const { events = [], nextToken: newNextToken } =
      await this.cloudWatchLogs.send(
        new FilterLogEventsCommand({
          logGroupName,
          startTime,
          nextToken,
        }),
      );

    return {
      events: events.map(
        (event) =>
          JSON.parse(event.message || '{}') as EventBridgeEvent<
            string,
            unknown
          >,
      ),
      nextToken: newNextToken,
    };
  }

  async getLogStreams(logGroupName: string) {
    const { logStreams = [] } = await this.cloudWatchLogs.send(
      new DescribeLogStreamsCommand({
        descending: true,
        logGroupName,
        orderBy: 'LastEventTime',
      }),
    );

    return { logStreams };
  }

  async deleteAllLogs(logGroupName: string): Promise<void> {
    // fixme. Need to paginate?
    const { logStreams } = await this.getLogStreams(logGroupName);
    if (logStreams.length <= 0) {
      return;
    }

    const logStreamNames = logStreams.map((s) => s.logStreamName || '');

    await Promise.all(
      logStreamNames.map((logStreamName) => {
        return this.cloudWatchLogs.send(
          new DeleteLogStreamCommand({
            logGroupName,
            logStreamName,
          }),
        );
      }),
    );
  }
}

export const eventBridgeSpy = (
  params: CloudWatchEventSpyParams,
): EventBridgeSpy => {
  const spy = new CloudWatchLogsEventBridgeSpy(params);
  spy.pollEvents();
  return spy;
};
