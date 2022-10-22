# DynamoDB

A collection of matchers that you can use to assert on DynamoDB items.

Use the `dynamodbItem()` helper function to specify which dynamoDB Item you are testing. It takes the following input parameters:

- `tableName`: The table name where the item should be found.
- `key`: They key of the item you are looking for
- `retryPolicy`: An optional [node-retry](https://github.com/tim-kos/node-retry) options config. sls-jest will retry using the given retry policy until the test passes or all the retries are exhausted. This is useful in an asynchronous context.

## Matchers

### `toExist()`

Asserts whether a DynamoDB item exists in the given table.

```ts
await expect(
  dynamodbItem({
    tableName: 'users',
    key: {
      pk: 'USER#123',
      sk: 'USER#123',
    },
  }),
).toExist();
```

### `toExistAndMatchObject(value)`

Asserts that an item exists in the given table, and matches a subset of the properties of an object. It works similarely to jest's [toMatchObject](https://jestjs.io/docs/expect#tomatchobjectobject).

```ts
await expect(
  dynamodbItem({
    tableName: 'todos',
    key: {
      id: '123',
    },
  }),
).toExistAndMatchObject({
  title: 'Buy milk',
});
```

### `toExistAndMatchSnapshot(propertiesOrHint?, hint?)`

Asserts that an item exists in the given table, and that it matches the most recent snapshot. It works similarely to jest's [toMatchSnapshot](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint).

```ts
await expect(
  dynamodbItem({
    tableName: 'todos',
    key: {
      id: '123',
    },
  }),
).toExistAndMatchSnapshot();
```

### `toExistAndMatchInlineSnapshot(propertiesOrHint?, hint?)`

Asserts that an item exists in the given table, and that it matches the most recent inline snapshot. It works similarely to jest's [toMatchInlineSnapshot](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot).

```ts
await expect(
  dynamodbItem({
    tableName: 'todos',
    key: {
      id: '123',
    },
  }),
).toExistAndMatchInlineSnapshot(`
  Object {
    "id": "123",
    "title": "Buy milk",
  }
`);
```
