import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import {
  HelperZodSchema,
  MatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';
import { Context } from '@aws-appsync/utils';
import { O } from 'ts-toolbelt';
import { z } from 'zod';

/**
 * Partial AWS AppSync context
 */
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
  /**
   * The path to a file containing containing a mapping template.
   */
  template: string;
  /**
   * The context to pass to the resolver function.
   */
  context: PartialContext;
  /**
   * An optional AppSync SDK client configuration.
   */
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
 * Helper function to describe an AppSync mapping template to test.
 *
 * Use with {@link expect} and any compatible matcher.
 * @see https://serverlessguru.gitbook.io/sls-jest/matchers/appsync
 *
 * @param input {@link AppSyncMappingTemplateInput}
 *
 * @example
 *
 * expect(appSyncMappingTemplate({
 *   template: 'src/resolvers/Query.getUser.request.vtl',
 *   context: {
 *     arguments: {
 *       id: '123'
 *     }
 *   }
 * })).toEvaluateTo({
 *   operation: 'GetItem',
 *   key: {
 *     id: { S: '123' }
 *   }
 * });
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
  /**
   * The path to a file containing an `APPSYNC_JS` resolver code.
   */
  code: string;
  /**
   * The function to evaluate. `request` or `response`.
   */
  function: 'request' | 'response';
  /**
   * The context to pass to the resolver function.
   */
  context: PartialContext;
  /**
   * An optional AppSync SDK client configuration.
   */
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
 * Helper function that describes an AppSync js resolver to test.
 *
 * Use with {@link expect} and any compatible matcher.
 * @see https://serverlessguru.gitbook.io/sls-jest/matchers/appsync
 *
 * @param input {@link AppSyncResolverInput}
 *
 * @example
 *
 * expect(appSyncResolver({
 *   code: 'src/resolvers/Query.getUser.js',
 *   function: 'request',
 *   context: {
 *     arguments: {
 *       id: '123'
 *     }
 *   }
 * })).toEvaluateTo({
 *   operation: 'GetItem',
 *   key: {
 *     id: { S: '123' }
 *   }
 * });
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
