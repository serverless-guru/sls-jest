import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import {
  HelperZodSchema,
  MatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';
import { Context } from '@aws-appsync/utils';
import { O } from 'ts-toolbelt';
import { z } from 'zod';

type PartialContext = O.Partial<
  Context<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >,
  'deep'
>;

/**
 * AppSync mapping template helper input
 */
export type AppSyncMappingTemplateInput = {
  template: string;
  context: PartialContext;
  clientConfig?: AppSyncClientConfig;
};

/**
 * Mapping Template schema
 */
const appSyncMappingTemplateInputSchema: HelperZodSchema<
  typeof appSyncMappingTemplate
> = z.object({
  template: z.string(),
  context: z.object({}),
});

/**
 * AppSync mapping template matcher helper.
 *
 * Use it to evaluate a mapping template and assert on the result.
 *
 * @param {string} template The path to a file containing containing a mapping template.
 * The path can either be absolute, or relative to the working directory (`process.cwd()`).
 * @param {object} context The context to pass to the resolver function.
 * @param {object} clientConfig An optional AppSync SDK client configuration.
 */
export const appSyncMappingTemplate: MatcherHelper<
  'appSyncMappingTemplate',
  AppSyncMappingTemplateInput
> = (input) => {
  assertMatcherHelperInputValue(
    'appSyncMappingTemplate',
    appSyncMappingTemplateInputSchema,
    input,
  );

  return {
    _slsJestHelperName: 'appSyncMappingTemplate',
    ...input,
  };
};

/**
 * AppSync js resolver helper input
 */
export type AppSyncResolverInput = {
  code: string;
  function: 'request' | 'response';
  context: PartialContext;
  clientConfig?: AppSyncClientConfig;
};

/**
 * AppSync Resolver schema
 */
const appSyncResolverInputSchema: HelperZodSchema<typeof appSyncResolver> =
  z.object({
    code: z.string(),
    function: z.enum(['request', 'response']),
    context: z.object({}),
  });

/**
 * AppSync Resolver matcher helper.
 *
 * Use it to evaluate a js resolver and assert on the result.
 *
 * @param {string} code The path to a file containing an `APPSYNC_JS` resolver code.
 * The path can either be absolute, or relative to the working directory (`process.cwd()`).
 * @param {string} function The function to evaluate. `request` or `response`.
 * @param {object} context The context to pass to the resolver function.
 * @param {object} clientConfig An optional AppSync SDK client configuration.
 */
export const appSyncResolver: MatcherHelper<
  'appSyncResolver',
  AppSyncResolverInput
> = (input) => {
  assertMatcherHelperInputValue(
    'appSyncResolver',
    appSyncResolverInputSchema,
    input,
  );

  return {
    _slsJestHelperName: 'appSyncResolver',
    ...input,
  };
};
