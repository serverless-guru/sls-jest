import {
  matcherHint,
  MatcherHintOptions,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { MatcherContext } from 'expect';
import { EvaluateMappingTemplateCommand } from '@aws-sdk/client-appsync';
import { Context, toMatchInlineSnapshot, toMatchSnapshot } from 'jest-snapshot';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';
import { AppSyncMappingTemplateInput } from '../../helpers/appsync';
import { MatcherFunction } from '../internal';
import { getAppSyncClient } from './client';
import { promises } from 'fs';
import path from 'path';
const { readFile } = promises;

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

const evaluateMappingTemplate = async (
  input: AppSyncMappingTemplateInput,
): Promise<object> => {
  const client = getAppSyncClient(input.clientConfig);

  const filePath = input.template.startsWith('/')
    ? input.template
    : path.resolve(`${process.cwd()}/${input.template}`);

  const code = await readFile(filePath, { encoding: 'utf8' });

  const { evaluationResult: received } = await client.send(
    new EvaluateMappingTemplateCommand({
      template: code,
      context: JSON.stringify(input.context),
    }),
  );

  if (!received) {
    throw new Error('Received empty response from AppSync');
  }

  try {
    const result = JSON.parse(received);
    if (typeof result !== 'object') {
      throw new Error(
        `The AppSync resolver did not return an object: ${received}`,
      );
    }

    return result;
  } catch (e) {
    throw new Error(
      `The AppSync mapping template did not return valid JSON: ${received}`,
    );
  }
};

export const toEvaluateTo: MatcherFunction = async function (
  this: MatcherContext,
  input: AppSyncMappingTemplateInput,
  expected: string | object,
) {
  const matcherName = 'toEvaluateTo';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
  };

  const received = await evaluateMappingTemplate(input);

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
  input: AppSyncMappingTemplateInput,
  ...rest: any
) {
  const received = await evaluateMappingTemplate(input);

  return toMatchSnapshot.call(this, received, ...rest);
};

export const toEvaluateToInlineSnapshot: MatcherFunction = async function (
  this: Context,
  input: AppSyncMappingTemplateInput,
  ...rest: any
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  this.error = new Error();

  const received = await evaluateMappingTemplate(input);

  return toMatchInlineSnapshot.call(this, received, ...rest);
};
