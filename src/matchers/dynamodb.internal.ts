import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { equals, iterableEquality, subsetEquality } from '@jest/expect-utils';
import { MatcherState } from 'expect';
import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';
import { toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { canonicalize } from 'json-canonicalize';
import { DynamodbItemInput } from '../helpers';
import { withRetry } from '../utils/retry';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const dynamoDbDocumentClients: Record<string, DynamoDBDocumentClient> = {};

const getDynamoDBDocumentClient = (config: DynamoDBClientConfig = {}) => {
  const key = canonicalize(config);
  if (!dynamoDbDocumentClients[key]) {
    dynamoDbDocumentClients[key] = DynamoDBDocumentClient.from(
      new DynamoDBClient(config),
    );
  }

  return dynamoDbDocumentClients[key];
};

export const toExist = withRetry(async function (
  this: MatcherState,
  params: DynamodbItemInput,
) {
  const { tableName, key, clientConfig } = params;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  const pass = !!received;

  return {
    message: () =>
      pass
        ? `Expected "${tableName}" table to not have item with key ${stringify(
            key,
          )}`
        : `Expected "${tableName}" table to have item with key ${stringify(
            key,
          )}`,
    pass: pass,
  };
});

export const toExistAndMatchObject = withRetry(async function (
  this: MatcherState,
  input: DynamodbItemInput,
  expected: GetCommandOutput['Item'],
) {
  const matcherName = 'toExistAndMatchObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  if (!received) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${stringify(key)}`,
      pass: false,
    };
  }

  const pass = equals(received, expected, [iterableEquality, subsetEquality]);

  const message = pass
    ? () =>
        matcherHint(matcherName, undefined, undefined, options) +
        '\n\n' +
        `Expected: not ${printExpected(expected)}\n` +
        (expected !== received
          ? `Received:     ${printReceived(received)}`
          : '')
    : () =>
        matcherHint(matcherName, undefined, undefined, options) +
        '\n\n' +
        printDiffOrStringify(
          expected,
          received,
          EXPECTED_LABEL,
          RECEIVED_LABEL,
          this.expand !== false,
        );

  return { actual: received, expected, message, name: matcherName, pass };
});

export const toExistAndMatchSnapshot = withRetry(async function (
  this: MatcherState,
  input: DynamodbItemInput,
  ...rest: any
) {
  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  if (!received) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${stringify(key)}`,
      pass: false,
    };
  }

  return toMatchSnapshot.call(
    this,
    received,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...rest,
  );
});

export const toExistAndMatchInlineSnapshot = withRetry(async function (
  this: MatcherState,
  input: DynamodbItemInput,
  ...rest: any
) {
  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  if (!received) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${stringify(key)}`,
      pass: false,
    };
  }

  return toMatchInlineSnapshot.call(
    this,
    received,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...rest,
  );
});