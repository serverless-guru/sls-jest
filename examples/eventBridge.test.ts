import * as asserts from '../lib/assertions';
import { eventBridgeSpy } from '../lib/spies/cloudwatch';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

expect.extend(asserts);

jest.setTimeout(30000);

const client = new EventBridgeClient({});

describe('EventBridge Spy', () => {
  it('should have matching event', async () => {
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

    await expect(spy).toHaveEventMatching({
      'detail-type': 'orderCreated',
      detail: {
        id: '123',
        createdAt: '2020-01-01T00:00:00.000Z',
      },
    });

    await spy.reset();
  });

  it('should have matching event times', async () => {
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
    await expect(spy).toHaveEventMatchingTimes(
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

  it('should hnot ave matching event', async () => {
    const spy = eventBridgeSpy({
      logGroupName: '/aws/events/event-bridge-spy',
    });

    await expect(spy).not.toHaveEventMatching({
      'detail-type': 'orderCreated',
      detail: {
        id: '123',
        createdAt: '2020-01-01T00:00:00.000Z',
      },
    });

    await spy.reset();
  });
});
