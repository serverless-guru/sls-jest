import * as asserts from '../src/assertions';
import { eventBridgeSpy, EventBridgeSpyParams } from '../src/spies/eventBridge';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { v4 as uuid } from 'uuid';

expect.extend(asserts);

jest.setTimeout(15000);

const client = new EventBridgeClient({});

describe.each([
  [
    'SQS',
    {
      type: 'sqs',
      config: {
        timeout: 10000,
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
        timeout: 10000,
        logGroupName: '/aws/events/event-bridge-spy',
      },
    } as EventBridgeSpyParams,
  ],
])('EventBridge Spy with %s', (type, config) => {
  it('should have event matching object', async () => {
    const spy = eventBridgeSpy(config);

    const order = {
      id: uuid(),
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

    await expect(spy).toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: order.id,
      },
    });

    await spy.reset();
  });

  it('should have event matching object times', async () => {
    const spy = eventBridgeSpy(config);

    const order = {
      id: uuid(),
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

    await spy.reset();
  });

  it('should not have event matching object', async () => {
    const spy = eventBridgeSpy(config);

    const order = {
      id: uuid(),
      createdAt: new Date().toISOString(),
    };
    await expect(spy).not.toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: order.id,
      },
    });

    await spy.reset();
  });
});
