import {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { EventBridgeEvent } from 'aws-lambda';
import { last } from 'lodash';
import { EventBridgeSpy } from './EventBridgeSpy';

export type CloudWatchEventSpyParams = {
  logGroupName: string;
  interval?: number;
  timeout?: number;
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
  promise?: Promise<void>;

  constructor(params: CloudWatchEventSpyParams) {
    super();

    const { logGroupName, interval = 2000, timeout = 10000 } = params;
    this.cloudWatchLogs = new CloudWatchLogsClient({});
    this.logGroupName = logGroupName;
    this.startTime = Date.now() - 2000;
    this.interval = interval;
    this.timeout = timeout;
  }

  async pollEvents(): Promise<void> {
    // start polling events
    this.intervalTimer = setInterval(async () => {
      this.promise = this.pullEvents();
      await this.promise;
    }, this.interval);

    // stop after timeout
    this.timeoutTimer = setTimeout(() => {
      this.intervalTimer && clearInterval(this.intervalTimer);
      this.finishedPolling();
    }, this.timeout);
  }

  async pullEvents() {
    const result = await this.cloudWatchLogs.send(
      new FilterLogEventsCommand({
        logGroupName: this.logGroupName,
        startTime: this.startTime,
        nextToken: this.nextToken,
      }),
    );
    this.nextToken = result.nextToken;

    const events = result.events?.map(
      (event) =>
        JSON.parse(event.message || '{}') as EventBridgeEvent<string, unknown>,
    );

    if (events) {
      this.appendEvents(events);
    }

    const lastTime = last(this.events)?.time;
    // use the last event's time, but only if there is no nextToken
    this.startTime =
      lastTime && !this.nextToken ? Date.parse(lastTime) : this.startTime;
  }

  async stopPolling() {
    this.timeoutTimer && clearTimeout(this.timeoutTimer);
    this.intervalTimer && clearInterval(this.intervalTimer);
    // to avoid unresoled promises after a test ends,
    // we wait until the last poll is finished
    await this.promise;
  }
}
