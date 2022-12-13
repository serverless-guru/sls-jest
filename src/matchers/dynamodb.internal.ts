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
import { DynamodbItemInput, DynamodbQueryItemsInput } from '../helpers';
import { withRetry } from '../utils/retry';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export const itemToExist = withRetry(async function (
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

export const queryItemsToExist = withRetry(async function (
  this: MatcherContext,
  params: DynamodbQueryItemsInput,
) {
  const { tableName, pk, indexName, clientConfig } = params;

  const client = getDynamoDBDocumentClient(clientConfig);

  const keyConditionExpression = '#pk = :pk';

  // TODO: implement sk filter
  const { Items: received } = await client.query({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: {
      // FIXME: depends on implementation
      '#pk': 'gsi2pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
  });

  const pass = received && received.length > 0 ? true : false;

  return {
    message: () =>
      pass
        ? `Expected "${tableName}" table to not have items with ${keyConditionExpression}`
        : `Expected "${tableName}" table to have items with ${keyConditionExpression}`,
    pass: pass,
  };
});

export const queryItemsToExistAndHaveLength = withRetry(async function (
  this: MatcherContext,
  params: DynamodbQueryItemsInput,
  length: number,
) {
  const { tableName, pk, indexName, clientConfig } = params;

  const client = getDynamoDBDocumentClient(clientConfig);

  const keyConditionExpression = '#pk = :pk';

  // TODO: implement sk filter
  const { Items: received } = await client.query({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: {
      // FIXME: depends on implementation
      '#pk': 'gsi2pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
  });

  const pass = received && received.length === length ? true : false;

  return {
    message: () =>
      pass
        ? `Expected "${tableName}" table to not have ${length} items with ${keyConditionExpression}, found ${received.length}`
        : `Expected "${tableName}" table to have ${length} items with ${keyConditionExpression}, found ${received.length}`,
    pass: pass,
  };
});

export const itemToExistAndMatchObject = withRetry(async function (
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

export const queryItemsToExistAndMatchObject = withRetry(async function (
  this: MatcherContext,
  input: DynamodbQueryItemsInput,
  expected: DynamodbQueryItemsInput[],
) {
  const matcherName = 'toExistAndMatchObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { tableName, pk, indexName, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const keyConditionExpression = '#pk = :pk';
  // TODO: implement sk filter
  const { Items: received } = await client.query({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: {
      // FIXME: depends on implementation
      '#pk': 'gsi2pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
  });

  if (!received || received.length === 0) {
    return {
      message: () =>
        `Expected "${tableName}" table to have item with key ${keyConditionExpression}`,
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

export const itemToExistAndMatchSnapshot = withRetry(async function (
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

export const queryItemsToExistAndMatchSnapshot = withRetry(async function (
  this: Context,
  input: DynamodbQueryItemsInput,
  ...rest: any
) {
  const { tableName, pk, indexName, clientConfig } = input;

  const client = getDynamoDBDocumentClient(clientConfig);

  const keyConditionExpression = '#pk = :pk';
  // TODO: implement sk filter
  const { Items: received } = await client.query({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: {
      // FIXME: depends on implementation
      '#pk': 'gsi2pk',
    },
    ExpressionAttributeValues: {
      ':pk': pk,
    },
  });

  if (!received || received.length === 0) {
    return {
      message: () =>
        `Expected "${tableName}" table to have items with  ${keyConditionExpression}`,
      pass: false,
    };
  }

  return toMatchSnapshot.call(this, received, ...rest);
});

export const itemToExistAndMatchInlineSnapshot = withRetry(async function (
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

export const queryItemsToExistAndMatchInlineSnapshot = withRetry(
  async function (this: Context, input: DynamodbQueryItemsInput, ...rest: any) {
    const { tableName, pk, indexName, clientConfig } = input;

    const client = getDynamoDBDocumentClient(clientConfig);

    const keyConditionExpression = '#pk = :pk';
    // TODO: implement sk filter
    const { Items: received } = await client.query({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: {
        // FIXME: depends on implementation
        '#pk': 'gsi2pk',
      },
      ExpressionAttributeValues: {
        ':pk': pk,
      },
    });

    if (!received || received.length === 0) {
      return {
        message: () =>
          `Expected "${tableName}" table to have item with ${keyConditionExpression}`,
        pass: false,
      };
    }

    return toMatchInlineSnapshot.call(this, received, ...rest);
  },
);
