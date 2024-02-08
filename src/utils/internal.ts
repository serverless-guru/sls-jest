import {
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { LambdaClient, LambdaClientConfig } from '@aws-sdk/client-lambda';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { canonicalize } from 'json-canonicalize';

const dynamoDbDocumentClients: Record<string, DynamoDBDocument> = {};
const cognitoClients: Record<string, CognitoIdentityProviderClient> = {};
const lambdaClients: Record<string, LambdaClient> = {};

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

export const getCognitoClient = (
  config: CognitoIdentityProviderClientConfig = {},
) => {
  const key = canonicalize(config);
  if (!cognitoClients[key]) {
    cognitoClients[key] = new CognitoIdentityProviderClient(config);
  }

  return cognitoClients[key];
};

export const getLambdaClient = (config: LambdaClientConfig = {}) => {
  const key = canonicalize(config);
  if (!lambdaClients[key]) {
    lambdaClients[key] = new LambdaClient(config);
  }

  return lambdaClients[key];
};
