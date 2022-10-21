import { canonicalize } from 'json-canonicalize';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

const dynamoDbDocumentClients: Record<string, DynamoDBDocument> = {};

export const getDynamoDBDocumentClient = (
  config: DynamoDBClientConfig = {},
) => {
  const key = canonicalize(config);
  if (!dynamoDbDocumentClients[key]) {
    dynamoDbDocumentClients[key] = DynamoDBDocument.from(
      new DynamoDBClient(config),
    );
  }

  return dynamoDbDocumentClients[key];
};
