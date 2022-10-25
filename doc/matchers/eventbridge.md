# EventBridge

Use those matchers in combinations with [EventBridge spies](../spies/eventbridge.md).

### `toHaveEventMatchingObject<TDetailType, Detail>(expected: Partial<EventBridgeEvent<TDetailType, TDetail>, 'deep'>)`

Asserts that an event was put on the spied event bus and that it matches a subset of the properties of an object. It works similarly to jest's [toMatchObject](https://jestjs.io/docs/expect#tomatchobjectobject).

```typescript
await expect(spy).toHaveEventMatchingObject<Order>({
  'detail-type': 'orderCreated',
  detail: {
    id: order.id,
  },
});
```

### `toHaveEventMatchingObjectTimes<TDetailType, Detail>(expected: Partial<EventBridgeEvent<TDetailType, TDetail>, 'deep'>, times: number)`

Same as `toHaveEventMatchingObject`, but it ensures that exactly `n` matching, but different, events have been seen in total.

Note: The spy will deduplicate any event that might have been received more than once (because of the at-least-once delivery policy nature of EventBridge). It does so, based on the event id.

```typescript
await expect(spy).toHaveEventMatchingObjectTimes<Order>(
  {
    'detail-type': 'orderCreated',
    detail: {
      id: order.id,
    },
  },
  1,
);
```
