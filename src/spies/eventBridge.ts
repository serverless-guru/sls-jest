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

type Params = {
  logGroupName: string;
  interval?: number;
  timeout?: number;
};

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

const cloudWatchLogs = new CloudWatchLogsClient({});

export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  intervalTimer: ReturnType<typeof setInterval> | undefined;
  timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  subscribers: Subscriber<EventBridgeEvent<string, unknown>[]>[] = [];
  observable: Observable<EventBridgeEvent<string, unknown>[]>;
  startTime: number;
  nextToken?: string;
  logGroupName: string;
  done = false;

  constructor(params: Params) {
    const { logGroupName, interval = 2000, timeout = 10000 } = params;
    this.logGroupName = logGroupName;
    this.startTime = Date.now() - 30000;
    // start polling events
    this.intervalTimer = setInterval(async () => {
      const startTime = this.startTime;
      const { events, nextToken: newNextToken } = await filterLogEvents({
        logGroupName,
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
    }, interval);
    // stop after timeout
    this.timeoutTimer = setTimeout(() => {
      this.intervalTimer && clearInterval(this.intervalTimer);
      this.subscribers.forEach((subscriber) => subscriber.complete());
      this.done = true;
    }, timeout);
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

  async reset(): Promise<void> {
    this.events = [];
    this.timeoutTimer && clearTimeout(this.timeoutTimer);
    this.intervalTimer && clearInterval(this.intervalTimer);
    this.subscribers.forEach((subscriber) => subscriber.complete());
    await deleteAllLogs(this.logGroupName);
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

export const eventBridgeSpy = (params: Params): EventBridgeSpy => {
  return new EventBridgeSpy(params);
};

type FilterLogEventsResult = {
  events: EventBridgeEvent<string, unknown>[];
  nextToken?: string;
};
const filterLogEvents = async (params: {
  logGroupName: string;
  startTime?: number;
  nextToken?: string;
}): Promise<FilterLogEventsResult> => {
  const { startTime, nextToken, logGroupName } = params;
  const { events = [], nextToken: newNextToken } = await cloudWatchLogs.send(
    new FilterLogEventsCommand({
      logGroupName,
      startTime,
      nextToken,
    }),
  );

  return {
    events: events.map(
      (event) =>
        JSON.parse(event.message || '{}') as EventBridgeEvent<string, unknown>,
    ),
    nextToken: newNextToken,
  };
};

const getLogStreams = async (logGroupName: string) => {
  const { logStreams = [] } = await cloudWatchLogs.send(
    new DescribeLogStreamsCommand({
      descending: true,
      logGroupName,
      orderBy: 'LastEventTime',
    }),
  );

  return { logStreams };
};

const deleteAllLogs = async (logGroupName: string): Promise<void> => {
  // fixme. Need to paginate?
  const { logStreams } = await getLogStreams(logGroupName);
  if (logStreams.length <= 0) {
    return;
  }

  const logStreamNames = logStreams.map((s) => s.logStreamName || '');

  await Promise.all(
    logStreamNames.map((logStreamName) => {
      return cloudWatchLogs.send(
        new DeleteLogStreamCommand({
          logGroupName,
          logStreamName,
        }),
      );
    }),
  );
};
