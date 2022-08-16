import { BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { AttributeValue, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { chunk, map, pick } from 'lodash';
import { getDynamoDBDocumentClient } from './internal';

type DynamoDBItemsCollection =
  | Record<string, any>[]
  | {
      [key: string]: Record<string, any>[];
    };

export const feedTable = async (
  tableName: string,
  items: DynamoDBItemsCollection,
) => {
  const client = getDynamoDBDocumentClient();

  const dynamoDbItems = Array.isArray(items) ? items : Object.values(items);

  // put items in batches of 25
  const chuncks = chunk(dynamoDbItems, 25);
  for (const chunk of chuncks) {
    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: map(chunk, (item) => ({
            PutRequest: {
              Item: item,
            },
          })),
        },
      }),
    );
  }
};

const tableKeys: Record<string, string[]> = {};

const getTableKeys = async (tableName: string) => {
  console.log('resolving keys');
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

export const truncateTable = async (tableName: string) => {
  const client = getDynamoDBDocumentClient();
  const key = await getTableKeys(tableName);

  let lastEvaluatedKey: Record<string, AttributeValue> | undefined;
  do {
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
        AttributesToGet: key,
      }),
    );
    lastEvaluatedKey = result.LastEvaluatedKey;

    const items = result.Items?.map((item) => pick(item, key)) || [];

    if (items.length === 0) {
      return;
    }

    const batches = chunk(items, 25);

    for (const batch of batches) {
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch.map((item) => ({
              DeleteRequest: {
                Key: item,
              },
            })),
          },
        }),
      );
    }
  } while (lastEvaluatedKey);
};
