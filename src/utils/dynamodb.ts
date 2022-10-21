import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import { AttributeValue, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { chunk, flatten, groupBy, map, pick, reduce } from 'lodash';
import { getDynamoDBDocumentClient } from './internal';
import { BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb';

export type DynamoDBItem = Record<string, NativeAttributeValue>;

export type DynamoDBItemCollection =
  | DynamoDBItem[]
  | {
      [itemName: string]: DynamoDBItem | DynamoDBItem[];
    };

export const feedTable = async (
  tableName: string,
  items: DynamoDBItemCollection,
) => {
  const client = getDynamoDBDocumentClient();

  const dynamoDbItems: DynamoDBItem[] = Array.isArray(items)
    ? items
    : flatten<DynamoDBItem>(Object.values(items));

  // put items in batches of 25
  const chuncks = chunk(dynamoDbItems, 25);
  for (const chunk of chuncks) {
    await client.batchWrite({
      RequestItems: {
        [tableName]: map(chunk, (item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });
  }
};

export const feedTables = async (items: {
  [tableName: string]: DynamoDBItemCollection;
}) => {
  // flatten all items into a single array
  const flatItems = reduce(
    items,
    (acc, tableItems, tableName) => {
      const dynamoDbItems: DynamoDBItem[] = Array.isArray(tableItems)
        ? tableItems
        : flatten<DynamoDBItem>(Object.values(tableItems));

      return [
        ...acc,
        ...map(dynamoDbItems, (item) => ({
          tableName,
          item,
        })),
      ];
    },
    [] as { tableName: string; item: DynamoDBItem }[],
  );

  const client = getDynamoDBDocumentClient();

  // batch items in batches of 25
  const chuncks = chunk(flatItems, 25);
  for (const chunk of chuncks) {
    // group back items by tableName
    const byTable = groupBy(chunk, 'tableName');
    await client.batchWrite({
      RequestItems: reduce(
        byTable,
        (acc, items, tableName) => {
          return {
            ...acc,
            [tableName]: map(items, ({ item }) => ({
              PutRequest: {
                Item: item,
              },
            })),
          };
        },
        {} as BatchWriteCommandInput['RequestItems'],
      ),
    });
  }
};

const tableKeys: Record<string, string[]> = {};

/**
 * Get the primary key of a table
 */
const getTableKeys = async (tableName: string) => {
  if (!tableKeys[tableName]) {
    const client = getDynamoDBDocumentClient();
    const { Table } = await client.send(
      new DescribeTableCommand({ TableName: tableName }),
    );

    const keySchema = Table?.KeySchema;

    if (!keySchema) {
      throw new Error(`Table "${tableName}" does not have a key schema`);
    }

    tableKeys[tableName] = keySchema.map(({ AttributeName }) => {
      if (!AttributeName) {
        throw new Error(`Table "${tableName}" has an invalid key schema`);
      }

      return AttributeName;
    });
  }

  return tableKeys[tableName];
};

export const truncateTable = async (tableName: string, keys?: string[]) => {
  const client = getDynamoDBDocumentClient();
  const key = keys ?? (await getTableKeys(tableName));

  let lastEvaluatedKey: Record<string, AttributeValue> | undefined;
  do {
    const result = await client.scan({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
      ExpressionAttributeNames: key.reduce(
        (keys, k) => ({
          ...keys,
          [`#${k}`]: k,
        }),
        {} as Record<string, string>,
      ),
      ProjectionExpression: key.map((k) => `#${k}`).join(', '),
    });
    lastEvaluatedKey = result.LastEvaluatedKey;

    const items = result.Items?.map((item) => pick(item, key)) || [];

    if (items.length === 0) {
      return;
    }

    const batches = chunk(items, 25);

    for (const batch of batches) {
      await client.batchWrite({
        RequestItems: {
          [tableName]: batch.map((item) => ({
            DeleteRequest: {
              Key: item,
            },
          })),
        },
      });
    }
  } while (lastEvaluatedKey);
};
