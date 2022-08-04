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
import { isEqual } from 'lodash';
import { toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export type VtlTemplateInput = {
  template: string;
  context: Record<string, unknown>;
};

export const toEvaluateTo = async function (
  this: MatcherState,
  params: VtlTemplateInput,
  expected: string,
) {
  const matcherName = 'toEqual';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const client = new AppSyncClient({});

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  const pass = isEqual(received, expected);

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

  // Passing the actual and expected objects so that a custom reporter
  // could access them, for example in order to display a custom visual diff,
  // or create a different error message
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
