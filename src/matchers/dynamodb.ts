import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

type toHaveItemExpectParams = {
  tableName: string;
  region?: string;
};

export type toHaveItemParams = {
  key: DocumentClient.Key;
  values?: DocumentClient.AttributeMap;
};

export const toHaveItem = async (
  expectParams: toHaveItemExpectParams,
  params: toHaveItemParams,
): Promise<AssertionResponse> => {
  const { tableName } = expectParams;
  const { key } = params;

  const { Item } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  const pass = Item !== undefined;

  return {
    message: () =>
      pass
        ? `expected "${tableName}" table to not have item ${JSON.stringify(
            key,
            null,
            2,
          )}`
        : `expected "${tableName}" table to have item ${JSON.stringify(
            key,
            null,
            2,
          )}`,
    pass,
  };
};
