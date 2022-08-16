import { canonicalize } from 'json-canonicalize';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
const dynamoDbDocumentClients: Record<string, DynamoDBDocumentClient> = {};

export const getDynamoDBDocumentClient = (
  config: DynamoDBClientConfig = {},
) => {
  const key = canonicalize(config);
  if (!dynamoDbDocumentClients[key]) {
    dynamoDbDocumentClients[key] = DynamoDBDocumentClient.from(
      new DynamoDBClient(config),
    );
  }

  return dynamoDbDocumentClients[key];
};
