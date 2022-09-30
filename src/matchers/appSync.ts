import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { MatcherContext } from 'expect';
import {
  AppSyncClient,
  AppSyncClientConfig,
  EvaluateMappingTemplateCommand,
} from '@aws-sdk/client-appsync';
import { toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';
import { maybeParseJson } from './utils';
import { canonicalize } from 'json-canonicalize';
import { AppSyncMappingTemplateInput } from '../helpers/appsync';
import { assertMatcherHelperInputType } from '../helpers/internal';
import { MatcherFunction } from './internal';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const appSyncClients: Record<string, AppSyncClient> = {};

const getAppSyncClient = (config: AppSyncClientConfig = {}) => {
  const key = canonicalize(config);
  if (!appSyncClients[key]) {
    appSyncClients[key] = new AppSyncClient(config);
  }

  return appSyncClients[key];
};

export const toEvaluateTo: MatcherFunction = async function (
  this: MatcherContext,
  input: AppSyncMappingTemplateInput,
  expected: string | object,
) {
  assertMatcherHelperInputType(
    'toEvaluateTo',
    ['appSyncMappingTemplate'],
    input,
  );

  const matcherName = 'toEvaluateTo';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const client = getAppSyncClient(input.clientConfig);

  let { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: input.template,
      context: JSON.stringify(input.context),
    }),
  );

  if (typeof expected === 'object') {
    received = maybeParseJson(received);
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

export const toEvaluateToSnapshot: MatcherFunction = async function (
  this: MatcherContext,
  input: AppSyncMappingTemplateInput,
  ...rest: any
) {
  assertMatcherHelperInputType(
    'toEvaluateToSnapshot',
    ['appSyncMappingTemplate'],
    input,
  );
  const client = getAppSyncClient(input.clientConfig);

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: input.template,
      context: JSON.stringify(input.context),
    }),
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return toMatchSnapshot.call(this, maybeParseJson(received), ...rest);
};

export const toEvaluateToInlineSnapshot: MatcherFunction = async function (
  this: MatcherContext,
  input: AppSyncMappingTemplateInput,
  ...rest: any
) {
  assertMatcherHelperInputType(
    'toEvaluateToInlineSnapshot',
    ['appSyncMappingTemplate'],
    input,
  );
  const client = getAppSyncClient(input.clientConfig);

  this.error = new Error();

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: input.template,
      context: JSON.stringify(input.context),
    }),
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return toMatchInlineSnapshot.call(this, maybeParseJson(received), ...rest);
};
