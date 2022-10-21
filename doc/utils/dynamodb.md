# DynamoB utils

## Functions

- `async feedTable(tableName: string, items: DynamoDBItemCollection)`

Inserts items into the given table.

example:

```ts
await feedTable('data', [
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

Note: Under the hood, items are inserted [in batches](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) of 25 items. It is recommended to group all your items together into one `feedTable` call as much as possible for performce.

- `async feedTables(items: { [tableName: string]: DynamoDBItemCollection} )`

Feeds several tables with the given data.

`items` is an object of which keys represents table names and values items a `DynamoDBItemCollection`.

```ts
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

Note: Under the hood, items are inserted [in batches](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) of 25 items. It is recommended to group all your items together into one `feedTables` call as much as possible for performce.

## Types

For TypeScript users, some types are also exported for your convenience.

- `DynamoDBItem`

Represents a single DynaoDB item, represented as plain JS objects.

example:

```ts
const item: DynamoDBItem = {
  pk: 'USER#123',
  sk: 'USER#123',
  id: '123',
  name: 'John',
};
```

- `DynamoDBItemCollection`

Represents a collection of DynamoDBTtems.

- an array of `DynamoDBItem`

example:

```ts
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

await feedTable('data' users);
```

- a key-value pair map of `DynamoDBItem` or `DynamoDBItem[]`

The key has no meaning and no impact on how the data that is actually stored in the table, but it can be useful for readability and/or to access items later easily.

example:

```ts
const data: DynamoDBItemCollection = {
  john: {
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

await feedTable('data' data);

// get orders for John
const orders = await getOrders(data.john.id);
```
