import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { EventBridgeEvent } from 'aws-lambda';
import { last } from 'lodash';
import { EventBridgeSpy, EventBridgeSpyConfig } from './EventBridgeSpy';

export type CloudWatchEventSpyConfig = EventBridgeSpyConfig & {
  logGroupName: string;
  interval?: number;
  clientConfig?: CloudWatchLogsClientConfig;
};

/**
 * An implementation of the EventBdridgeSpy, using CloudWatch logs as
 * an event subscriber.
 * */
export class CloudWatchLogsEventBridgeSpy extends EventBridgeSpy {
  intervalTimer: ReturnType<typeof setInterval> | undefined;
  startTime: number;
  interval: number;
  nextToken?: string;
  logGroupName: string;
  cloudWatchLogsClient: CloudWatchLogsClient;
  currentPromise?: Promise<void>;

  constructor(config: CloudWatchEventSpyConfig) {
    const {
      logGroupName,
      interval = 2000,
      clientConfig = {},
      ...defaultConfig
    } = config;

    super(defaultConfig);

    this.cloudWatchLogsClient = new CloudWatchLogsClient(clientConfig);
    this.logGroupName = logGroupName;
    this.startTime = Date.now() - 2000;
    this.interval = interval;
  }

  async startPolling() {
    // start polling events
    this.intervalTimer = setInterval(async () => {
      this.currentPromise = this.pullEvents();
      await this.currentPromise;
    }, this.interval);
  }

  async pullEvents() {
    const result = await this.cloudWatchLogsClient.send(
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
    if (lastTime && !this.nextToken) {
      this.startTime = Date.parse(lastTime);
    }
  }

  async stopPolling() {
    this.intervalTimer && clearInterval(this.intervalTimer);
    // to avoid unresolved promises after a test ends,
    // we wait until the last poll is finished
    await this.currentPromise;
  }
}
