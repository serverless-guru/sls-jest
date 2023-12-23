# DynamoB

## Functions

### `feedTable(tableName: string, items: DynamoDBItemCollection)`

Inserts items into the given table.

example:

```typescript
await feedTable('users', [
  {
    pk: 'USER#123',
    sk: 'USER#123',
    id: '123',
    name: 'John',
  },
  {
    pk: 'USER#456',
    sk: 'USER#456',
    id: '456',
    name: 'Jane',
  },
]);
```

Note: Under the hood, items are inserted [in batches](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) of 25 items. It is recommended to group all your items together into one `feedTable` call as much as possible for performance.

### `feedTables(items: { [tableName: string]: DynamoDBItemCollection })`

Feeds several tables with the given data.

The `items` parameter is an object of which the keys represent table names, and the values a `DynamoDBItemCollection`.

```typescript
await feedTables({
  // insert into the users table
  users: [
    {
      id: '123',
      name: 'John',
    },
    {
      id: '456',
      name: 'Jane',
    },
  ],
  // insert into the orders table
  orders: [
    {
      id: '1',
      total: 123,
    },
    {
      id: '2',
      total: 456,
    },
  ],
});
```

Note: Under the hood, items are inserted [in batches](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) of 25 items. It is recommended to group all your items together into one `feedTables` call as much as possible for performance.

### `truncateTable(tableName: string, keys?: string[])`

Deletes all the items from a table. It is useful for cleaning up data between tests.

`keys` represent the primary key (Partition Key and, optionally, the Sort Key). If not passed, `sls-jest` will try to infer it from the [table description](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html).

example:

```typescript
await truncateTable('users');
```

## Types

For TypeScript users, some types are also exported for your convenience.

### `DynamoDBItem`

Represents a single DynamoDB item, represented as a plain JS object.

example:

```typescript
const item: DynamoDBItem = {
  pk: 'USER#123',
  sk: 'USER#123',
  id: '123',
  name: 'John',
};
```

### `DynamoDBItemCollection`

Represents a collection of `DynamoDBItem`. It can be:

- An array of `DynamoDBItem` (`DynamoDBItem[]`)

example:

```typescript
const users: DynamoDBItemCollection = [
  {
    pk: 'USER#123',
    sk: 'USER#123',
    id: '123',
    name: 'John',
  },
  {
    pk: 'USER#456',
    sk: 'USER#456',
    id: '456',
    name: 'Jane',
  },
];

await feedTable('data', users);
```

- A dictionary of `DynamoDBItem` or `DynamoDBItem[]`

The key has no meaning and no impact on how the data that is actually stored in the table, but it can be useful for readability and/or to access items later easily.

example:

```typescript
const data: DynamoDBItemCollection = {
  user: {
    pk: 'USER#123',
    sk: 'USER#123',
    id: '123',
    name: 'John',
  },
  orders: [
    {
      pk: 'USER#123',
      sk: 'ORDER#1',
      total: 123,
    },
    {
      pk: 'USER#123',
      sk: 'ORDER#2',
      total: 123,
    },
  ],
};

await feedTable('data', data);

// get orders for the user
const orders = await getOrders(data.user.id);
expect(orders).toMatch(data.orders);
```
