import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
import { AttributeValue, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { chunk, flatten, map, pick } from 'lodash';
import { getDynamoDBDocumentClient } from './internal';

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
  for (const [tableName, tableItems] of Object.entries(items)) {
    await feedTable(tableName, tableItems);
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
      AttributesToGet: key,
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
