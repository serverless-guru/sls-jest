import {
  AdminGetUserCommand,
  AdminGetUserResponse,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { equals, iterableEquality, subsetEquality } from '@jest/expect-utils';
import { MatcherContext } from 'expect';
import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { Context, toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { CognitoUserInput } from '../helpers';
import { getCognitoClient } from '../utils/internal';
import { withRetry } from '../utils/retry';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export const toExist = withRetry(async function (
  this: MatcherContext,
  params: CognitoUserInput,
) {
  const { userPoolId, username, clientConfig } = params;

  const client = getCognitoClient(clientConfig);

  let pass = false;
  try {
    await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );
    pass = true;
  } catch (e) {
    if (!(e instanceof UserNotFoundException)) {
      throw e;
    }
    pass = false;
  }

  return {
    message: () =>
      pass
        ? `Expected "${userPoolId}" user pool not to have a user with username "${username}"`
        : `Expected "${userPoolId}" user pool to have a user with username "${username}"`,
    pass: pass,
  };
});

export const toExistAndMatchObject = withRetry(async function (
  this: MatcherContext,
  input: CognitoUserInput,
  expected: AdminGetUserResponse,
) {
  const matcherName = 'toExistAndMatchObject';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const { userPoolId, username, clientConfig } = input;

  const client = getCognitoClient(clientConfig);

  try {
    const { $metadata, ...received } = await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );

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
  } catch (e) {
    if (e instanceof UserNotFoundException) {
      return {
        message: () =>
          `Expected "${userPoolId}" user pool to have a user with username "${username}"`,
        pass: false,
      };
    }

    throw e;
  }
});

export const toExistAndMatchSnapshot = withRetry(async function (
  this: Context,
  input: CognitoUserInput,
  ...rest: any
) {
  const { userPoolId, username, clientConfig } = input;

  const client = getCognitoClient(clientConfig);
  try {
    const { $metadata, ...received } = await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );

    if (!received) {
      return {
        message: () =>
          `Expected "${userPoolId}" user pool to have user with username "${username}"`,
        pass: false,
      };
    }

    return toMatchSnapshot.call(this, received, ...rest);
  } catch (e) {
    if (e instanceof UserNotFoundException) {
      return {
        message: () =>
          `Expected "${userPoolId}" user pool to have a user with username "${username}"`,
        pass: false,
      };
    }

    throw e;
  }
});

export const toExistAndMatchInlineSnapshot = withRetry(async function (
  this: Context,
  input: CognitoUserInput,
  ...rest: any
) {
  const { userPoolId, username, clientConfig } = input;

  const client = getCognitoClient(clientConfig);

  try {
    const { $metadata, ...received } = await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );

    if (!received) {
      return {
        message: () =>
          `Expected "${userPoolId}" user pool to have user with username "${username}"`,
        pass: false,
      };
    }

    return toMatchInlineSnapshot.call(this, received, ...rest);
  } catch (e) {
    if (e instanceof UserNotFoundException) {
      return {
        message: () =>
          `Expected "${userPoolId}" user pool to have a user with username "${username}"`,
        pass: false,
      };
    }

    throw e;
  }
});
