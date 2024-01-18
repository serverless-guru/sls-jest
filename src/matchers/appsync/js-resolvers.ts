import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { MatcherContext } from 'expect';
import { EvaluateCodeCommand, RuntimeName } from '@aws-sdk/client-appsync';
import { Context, toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';
import { AppSyncResolverInput } from '../../helpers/appsync';
import { MatcherFunction } from '../internal';
import { getAppSyncClient } from './client';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const evaluateResolver = async (
  input: AppSyncResolverInput,
): Promise<string> => {
  const client = getAppSyncClient(input.clientConfig);

  const { evaluationResult: received, error } = await client.send(
    new EvaluateCodeCommand({
      code: input.code,
      function: input.function,
      runtime: {
        name: RuntimeName.APPSYNC_JS,
        runtimeVersion: '1.0.0',
      },
      context: JSON.stringify(input.context),
    }),
  );

  if (error) {
    throw new Error(`AppSync resolver evaluation failed: ${error.message}`);
  }

  if (!received) {
    throw new Error('Received empty response from AppSync');
  }

  return JSON.parse(received);
};

export const toEvaluateTo: MatcherFunction = async function (
  this: MatcherContext,
  input: AppSyncResolverInput,
  expected: string | object,
) {
  const matcherName = 'toEvaluateTo';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const received = await evaluateResolver(input);

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
};

export const toEvaluateToSnapshot: MatcherFunction = async function (
  this: Context,
  input: AppSyncResolverInput,
  ...rest: any
) {
  const received = await evaluateResolver(input);

  return toMatchSnapshot.call(this, received, ...rest);
};

export const toEvaluateToInlineSnapshot: MatcherFunction = async function (
  this: Context,
  input: AppSyncResolverInput,
  ...rest: any
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  this.error = new Error();

  const received = await evaluateResolver(input);

  return toMatchInlineSnapshot.call(this, received, ...rest);
};
