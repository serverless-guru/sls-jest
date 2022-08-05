import { EventBridgeSpy, eventBridgeSpy, EventBridgeSpyParams } from '@sls-jest/core';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import crypto from 'crypto';

jest.setTimeout(30000);

const client = new EventBridgeClient({});

describe.each([
  [
    'SQS',
    {
      type: 'sqs',
      config: {
        clientConfig: { region: 'us-east-1' },
        waitTimeSeconds: 2000,
        matcherDefaultTimeout: 10_000,
        queueUrl:
          'https://sqs.us-east-1.amazonaws.com/379730309663/spy-queue.fifo',
      },
    } as EventBridgeSpyParams,
  ],
  [
    'CloudWatchLogs',
    {
      type: 'cloudWatchLogs',
      config: {
        clientConfig: { region: 'us-east-1' },
        matcherDefaultTimeout: 15_000,
        logGroupName: '/aws/events/event-bridge-spy',
      },
    } as EventBridgeSpyParams,
  ],
])('EventBridge Spy with %s', (type, config) => {
  let spy: EventBridgeSpy;

  beforeAll(async () => {
    spy = eventBridgeSpy(config);
  });

  afterEach(() => {
    spy.reset();
  });

  afterAll(async () => {
    await spy.stop();
  });

  it('should have event matching object', async () => {
    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    // AWS SDK error wrapper for TimeoutError: socket hang up
    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: 'default',
            DetailType: 'orderCreated',
            Source: 'sls-jest',
            Detail: JSON.stringify(order),
          },
        ],
      }),
    );

    await expect(spy).toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: order.id,
      },
    });
  });

  it('should have event matching object times', async () => {
    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: 'default',
            DetailType: 'orderCreated',
            Source: 'sls-jest',
            Detail: JSON.stringify(order),
          },
        ],
      }),
    );

    // matches an event exactly once
    await expect(spy).toHaveEventMatchingObjectTimes(
      {
        'detail-type': 'orderCreated',
        detail: {
          id: order.id,
        },
      },
      1,
    );
  });

  it('should not have event matching object', async () => {
    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await expect(spy).not.toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: order.id,
      },
    });
  });
});
