import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
} from '@aws-sdk/client-sqs';
import { EventBridgeEvent } from 'aws-lambda';
import { EventBridgeSpy } from './EventBridgeSpy';

export type SqsEventSpyParams = {
  timeout?: number;
  queueUrl: string;
  waitTimeSeconds: number;
};

/**
 * An implementation of the EventBdridgeSpy, using SQS as
 * an event subscriber.
 * */
export class SQSEventBridgeSpy extends EventBridgeSpy {
  timeout: number;
  sqsClient: SQSClient;
  queueUrl: string;
  waitTimeSeconds: number;
  promise?: Promise<void>;
  done = false;

  constructor(params: SqsEventSpyParams) {
    super();

    const { queueUrl, timeout = 10000, waitTimeSeconds = 2000 } = params;
    this.sqsClient = new SQSClient({});
    this.queueUrl = queueUrl;
    this.waitTimeSeconds = waitTimeSeconds;
    this.timeout = timeout;
  }

  async pollEvents(): Promise<void> {
    let timer = this.timeout;
    do {
      const timeout = Math.min(Math.round(timer / 1000), this.waitTimeSeconds);
      const start = Date.now();
      this.promise = this.pullEvents(timeout);
      await this.promise;
      const end = Date.now() - start;
      timer -= end;
    } while (timer > 0 && !this.done);

    this.finishedPolling();
  }

  async pullEvents(timeout: number) {
    const result = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: timeout,
        VisibilityTimeout: Math.ceil(timeout / 1000),
      }),
    );

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
  }

  async stopPolling() {
    this.done = true;
    // to avoid unresoled promises after a test ends,
    // we wait until the last poll is finished
    await this.promise;
  }
}
