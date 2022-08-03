import * as asserts from '../src/assertions';
import { eventBridgeSpy } from '../src/spies/eventBridge';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

expect.extend(asserts);

jest.setTimeout(30000);

const client = new EventBridgeClient({});

describe('EventBridge Spy', () => {
  it('should have event object', async () => {
    const spy = eventBridgeSpy({
      logGroupName: '/aws/events/event-bridge-spy',
    });

    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: 'default',
            DetailType: 'orderCreated',
            Source: 'sls-jest',
            Detail: JSON.stringify({
              id: '123',
              createdAt: '2020-01-01T00:00:00.000Z',
            }),
          },
        ],
      }),
    );

    await expect(spy).toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: '123',
        createdAt: expect.any(String),
      },
    });

    await spy.reset();
  });

  it('should have event matching object times', async () => {
    const spy = eventBridgeSpy({
      logGroupName: '/aws/events/event-bridge-spy',
    });

    await client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: 'default',
            DetailType: 'orderCreated',
            Source: 'sls-jest',
            Detail: JSON.stringify({
              id: '456',
              createdAt: '2020-01-01T00:00:00.000Z',
            }),
          },
        ],
      }),
    );

    // natches an event exactly once
    await expect(spy).toHaveEventMatchingObjectTimes(
      {
        'detail-type': 'orderCreated',
        detail: {
          id: '456',
          createdAt: '2020-01-01T00:00:00.000Z',
        },
      },
      1,
    );

    await spy.reset();
  });

  it('should not have event matching object', async () => {
    const spy = eventBridgeSpy({
      logGroupName: '/aws/events/event-bridge-spy',
    });

    await expect(spy).not.toHaveEventMatchingObject({
      'detail-type': 'orderCreated',
      detail: {
        id: '789',
        createdAt: '2020-01-01T00:00:00.000Z',
      },
    });

    await spy.reset();
  });
});
