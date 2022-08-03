import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { equals } from '@jest/expect-utils';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { MatcherState } from 'expect';
import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export type DynamodbItemInput = {
  tableName: string;
  key: DocumentClient.Key;
  region?: string;
};

export const toExist = async function (
  this: MatcherState,
  input: DynamodbItemInput,
) {
  const { tableName, key, region } = input;

  // Note: we create a new client instance each time this matcher is called
  // TODO improve this by reusing the same client instance??
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region,
    }),
  );

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
};

export const toHaveItemMatchingObject = async function (
  this: MatcherState,
  input: DynamodbItemInput,
  expected: DocumentClient.AttributeMap,
) {
  const matcherName = 'toHaveItemMatchingObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { tableName, key, region } = input;

  // Note: we create a new client instance each time this matcher is called
  // TODO improve this by reusing the same client instance??
  const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region,
    }),
  );

  const { Item: received } = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: key,
    }),
  );

  const pass = equals(received, expected);

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
};
