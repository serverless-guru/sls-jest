import { equals, iterableEquality, subsetEquality } from '@jest/expect-utils';
import { MatcherContext } from 'expect';
import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';
import { Context, toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { DynamoDBItem } from '../utils/dynamodb';
import { getDynamoDBDocumentClient } from '../utils/internal';
import { DynamodbItemInput } from '../helpers';
import { withRetry } from '../utils/retry';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export const toExist = withRetry(async function (
  this: MatcherContext,
  params: DynamodbItemInput,
) {
  const { tableName, key, clientConfig } = params;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.get({
    TableName: tableName,
    Key: key,
  });

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
  this: MatcherContext,
  input: DynamodbItemInput,
  expected: DynamoDBItem,
) {
  const matcherName = 'toExistAndMatchObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.get({
    TableName: tableName,
    Key: key,
  });

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
  this: Context,
  input: DynamodbItemInput,
  ...rest: any
) {
  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.get({
    TableName: tableName,
    Key: key,
  });

  if (!received) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${stringify(key)}`,
      pass: false,
    };
  }

  return toMatchSnapshot.call(this, received, ...rest);
});

export const toExistAndMatchInlineSnapshot = withRetry(async function (
  this: Context,
  input: DynamodbItemInput,
  ...rest: any
) {
  const { tableName, key, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const { Item: received } = await client.get({
    TableName: tableName,
    Key: key,
  });

  if (!received) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${stringify(key)}`,
      pass: false,
    };
  }

  return toMatchInlineSnapshot.call(this, received, ...rest);
});
