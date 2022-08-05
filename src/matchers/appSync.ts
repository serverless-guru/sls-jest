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
  AppSyncClientConfig,
  EvaluateMappingTemplateCommand,
} from '@aws-sdk/client-appsync';
import { toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';
import { maybeParseJson } from './utils';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const appSyncClients: Record<string, AppSyncClient> = {};

const getAppSyncClient = (config: AppSyncClientConfig = {}) => {
  const key = JSON.stringify(config);
  if (!appSyncClients[key]) {
    appSyncClients[key] = new AppSyncClient(config);
  }

  return appSyncClients[key];
};

export type VtlTemplateInput = {
  template: string;
  context: O.Partial<
    AppSyncResolverEvent<Record<string, unknown>, Record<string, unknown>>,
    'deep'
  >;
  clientConfig?: AppSyncClientConfig;
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

  const client = getAppSyncClient(params.clientConfig);

  let { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  if (typeof expected === 'object') {
    try {
      received = maybeParseJson(received);
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
  const client = getAppSyncClient(params.clientConfig);

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  // @ts-ignore
  return toMatchSnapshot.call(this, maybeParseJson(received), ...rest);
};

export const toEvaluateToInlineSnapshot = async function (
  this: MatcherState,
  params: VtlTemplateInput,
  ...rest: any
) {
  const client = getAppSyncClient(params.clientConfig);

  this.error = new Error();

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: params.template,
      context: JSON.stringify(params.context),
    }),
  );

  // @ts-ignore
  return toMatchInlineSnapshot.call(this, maybeParseJson(received), ...rest);
};
