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
 * AppSync mapping template helper
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
 * Mapping Template schema
 */
const appSyncResolverInputSchema: HelperZodSchema<typeof appSyncResolver> =
  z.object({
    code: z.string(),
    function: z.enum(['request', 'response']),
    context: z.object({}),
  });

/**
 * AppSync mapping template helper
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
