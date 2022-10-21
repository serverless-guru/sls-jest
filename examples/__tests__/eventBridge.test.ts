import { EventBridgeSpy, eventBridgeSpy, EventBridgeSpyParams } from 'sls-jest';
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
      adapter: 'sqs',
      eventBusName: 'default',
      config: {
        clientConfig: { region: 'us-east-1' },
        waitTimeSeconds: 2000,
        matcherDefaultTimeout: 20_000,
      },
    } as EventBridgeSpyParams,
  ],
  [
    'CloudWatchLogs',
    {
      adapter: 'cw',
      eventBusName: 'default',
      config: {
        clientConfig: { region: 'us-east-1' },
        matcherDefaultTimeout: 20_000,
      },
    } as EventBridgeSpyParams,
  ],
])('EventBridge Spy with %s', (type, config) => {
  let spy: EventBridgeSpy;

  beforeAll(async () => {
    spy = await eventBridgeSpy(config);
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

    // Put an event into event bridge
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

    // Assert that it was seen by the spy
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

    // Put an event into event bridge
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

    // Assert that it was seen by the spy
    // The event should be seen exactly once
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
    // Assert that no events were seen by the spy
    await expect(spy).not.toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: order.id,
      },
    });
  });
});
