import {
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { find } from 'lodash';

const client = new DynamoDBClient({});

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

export const toHaveItem = async (
  tableName: string,
  key: DocumentClient.Key,
): Promise<AssertionResponse> => {
  const result = await client.send(
    new GetItemCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  const pass = result.Item !== undefined;

  return {
    message: () =>
      `expected ${tableName} to have Item ${JSON.stringify(key, null, 2)}`,
    pass,
  };
};

export const toHaveItems = async (
  tableName: string,
  keys: DocumentClient.Key[],
): Promise<AssertionResponse> => {
  const result = await client.send(
    new BatchGetItemCommand({
      RequestItems: {
        [tableName]: {
          Keys: keys,
        },
      },
    }),
  );

  const pass = result.Responses?.[tableName]?.length === keys.length;

  let missing: DocumentClient.Key[] = [];
  if (!pass) {
    // FIXME: Find out how to use color diff.
    missing = keys.filter((key) => find(result.Responses?.[tableName], key));
  }

  return {
    message: () =>
      `expected ${tableName} to have Items ${JSON.stringify(
        keys,
      )}. Missing: ${JSON.stringify(missing)}`,
    pass,
  };
};
