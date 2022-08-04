import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
  SQSClientConfig,
} from '@aws-sdk/client-sqs';
import { EventBridgeEvent } from 'aws-lambda';
import { clamp } from 'lodash';
import { EventBridgeSpy, EventBridgeSpyConfig } from './EventBridgeSpy';
import { v4 as uuid } from 'uuid';

export type SqsEventSpyConfig = EventBridgeSpyConfig & {
  queueUrl: string;
  waitTimeSeconds: number;
  clientConfig?: SQSClientConfig;
};

/**
 * An implementation of the EventBdridgeSpy, using SQS as
 * an event subscriber.
 * */
export class SQSEventBridgeSpy extends EventBridgeSpy {
  sqsClient: SQSClient;
  queueUrl: string;
  waitTimeSeconds: number;
  currentPromise?: Promise<void>;
  isStopped = false;

  constructor(config: SqsEventSpyConfig) {
    const {
      queueUrl,
      waitTimeSeconds = 2000,
      clientConfig = {},
      ...defaultConfig
    } = config;

    super(defaultConfig);

    this.sqsClient = new SQSClient(clientConfig);
    this.queueUrl = queueUrl;
    this.waitTimeSeconds = waitTimeSeconds;
  }

  async startPolling() {
    do {
      this.currentPromise = this.pullEvents();
      await this.currentPromise;
    } while (!this.isStopped);
  }

  async pullEvents() {
    const result = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: clamp(this.waitTimeSeconds, 0, 20),
      }),
    );

    const events = result.Messages?.map(
      (message) =>
        JSON.parse(message.Body || '{}') as EventBridgeEvent<string, unknown>,
    );

    if (events) {
      this.appendEvents(events);
      this.sqsClient.send(
        new DeleteMessageBatchCommand({
          QueueUrl: this.queueUrl,
          Entries: result.Messages?.map((message) => ({
            Id: uuid(),
            ReceiptHandle: message.ReceiptHandle,
          })),
        }),
      );
    }
  }

  async stopPolling() {
    this.isStopped = true;
    // to avoid unresoled promises after a test ends,
    // we wait until the last poll is finished
    await this.currentPromise;
  }
}
