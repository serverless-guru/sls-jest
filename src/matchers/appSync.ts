import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { MatcherState } from 'expect';
import {
  AppSyncClient,
  EvaluateMappingTemplateCommand,
} from '@aws-sdk/client-appsync';
import { toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export type VtlTemplateInput = {
  template: string;
  context: O.Partial<AppSyncResolverEvent<Record<string, unknown>>, 'deep'>;
};

export const toEvaluateTo = async function (
  this: MatcherState,
  params: VtlTemplateInput,
  expected: string | object,
) {
  const matcherName = 'toEvaluateTo';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const client = new AppSyncClient({});

  let { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  if (received && typeof expected === 'object') {
    try {
      received = JSON.parse(received);
    } catch (error) {}
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
};

export const toEvaluateToSnapshot = async function (
  this: MatcherState,
  params: VtlTemplateInput,
  ...rest: any
) {
  const client = new AppSyncClient({});

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  // @ts-ignore
  return toMatchSnapshot.call(this, received, ...rest);
};

export const toEvaluateToInlineSnapshot = async function (
  this: MatcherState,
  params: VtlTemplateInput,
  ...rest: any
) {
  const client = new AppSyncClient({});

  this.error = new Error();

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  // @ts-ignore
  return toMatchInlineSnapshot.call(this, received, ...rest);
};
