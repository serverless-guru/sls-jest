import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy, last } from 'lodash';
import { DateTime } from 'luxon';
import { BehaviorSubject } from 'rxjs';
import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
  DescribeLogStreamsCommand,
  DeleteLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  DeleteMessageBatchCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';

export type EventBridgeSpyParams =
  | {
      type: 'cloudWatchLogs';
      config: CloudWatchEventSpyParams;
    }
  | {
      type: 'sqs';
      config: SqsEventSpyParams;
    };

export const eventBridgeSpy = (
  params: EventBridgeSpyParams,
): EventBridgeSpy => {
  const { type, config } = params;

  let spy: EventBridgeSpy;

  if (type === 'cloudWatchLogs') {
    spy = new CloudWatchLogsEventBridgeSpy(config);
  } else if (type === 'sqs') {
    spy = new SQSEventBridgeSpy(config);
  } else {
    throw new Error(`Unknown eventBridgeSpy type: ${type}`);
  }

  spy.pollEvents();
  return spy;
};

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

/**
 * A basic class for spying on EventBridge events.
 */
export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  subject: BehaviorSubject<EventBridgeEvent<string, unknown>[]>;
  done = false;

  constructor() {
    // create observable
    this.subject = new BehaviorSubject(this.events);
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

  appendEvents(events: EventBridgeEvent<string, unknown>[]): void {
    const uniqueEvents = uniqBy(events, 'id');
    this.events = uniqBy([...this.events, ...uniqueEvents], 'id');
    this.subject.next(this.events);
  }

  awaitEvents(
    matcher: EventMatcher,
  ): Promise<EventBridgeEvent<string, unknown>[]> {
    return new Promise<EventBridgeEvent<string, unknown>[]>((resolve) => {
      const sub = this.subject.subscribe({
        next: (events) => {
          if (matcher(events)) {
            sub.unsubscribe();
            resolve(events);
          }
        },
        complete: () => {
          resolve(this.events);
        },
      });
    });
  }

  notifySubscribers() {
    this.done = true;
    this.subject.next(this.events);
    this.subject.complete();
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
      this.appendEvents(events);
      const lastTime = last(this.events)?.time;
      // use the last event's time, but only if there is no nextToken
      this.startTime =
        lastTime && !newNextToken
          ? DateTime.fromISO(lastTime).toMillis()
          : startTime;
    }, this.interval);
    // stop after timeout
    this.timeoutTimer = setTimeout(() => {
      this.intervalTimer && clearInterval(this.intervalTimer);
      this.notifySubscribers();
    }, this.timeout);
  }

  async stopPoller() {
    this.timeoutTimer && clearTimeout(this.timeoutTimer);
    this.intervalTimer && clearInterval(this.intervalTimer);
    this.notifySubscribers();
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

  async deleteAllLogs(logGroupName: string): Promise<void> {
    // fixme. Need to paginate?
    const { logStreams = [] } = await this.cloudWatchLogs.send(
      new DescribeLogStreamsCommand({
        descending: true,
        logGroupName,
        orderBy: 'LastEventTime',
      }),
    );

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

type SqsEventSpyParams = {
  timeout?: number;
  queueUrl: string;
};

/**
 * An implementation of the EventBdridgeSpy, using SQS as
 * an event subscriber.
 * */
export class SQSEventBridgeSpy extends EventBridgeSpy {
  timeout: number;
  sqsClient: SQSClient;
  queueUrl: string;
  promise?: Promise<ReceiveMessageCommandOutput>;

  constructor(params: SqsEventSpyParams) {
    super();
    const { queueUrl, timeout = 10000 } = params;

    this.sqsClient = new SQSClient({});
    this.queueUrl = queueUrl;
    this.timeout = timeout;
  }

  async pollEvents(): Promise<void> {
    let timer = this.timeout;
    do {
      const timeout = Math.round(Math.min(timer / 1000, 1));
      const start = Date.now();
      this.promise = this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: timeout,
          VisibilityTimeout: Math.ceil(timer / 1000),
        }),
      );
      const result = await this.promise;
      const events = result.Messages?.map(
        (message) =>
          JSON.parse(message.Body || '{}') as EventBridgeEvent<string, unknown>,
      );

      if (events) {
        this.subject;
        this.appendEvents(events);
        this.sqsClient.send(
          new DeleteMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: result.Messages?.map((message) => ({
              Id: message.MessageId,
              ReceiptHandle: message.ReceiptHandle,
            })),
          }),
        );
      }
      const end = Date.now() - start;
      timer -= end;
    } while (timer > 0 && !this.done);

    this.notifySubscribers();
  }

  async stopPoller() {
    this.done = true;
    if (this.promise) {
      // FIXME: we have to wait until the last poll is finihsed
      // otherwise it could pick up an event from a following test.
      // is there a way to avoid this?
      await this.promise;
    }
  }
}
