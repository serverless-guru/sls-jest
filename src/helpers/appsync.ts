import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { AppSyncResolverEvent } from 'aws-lambda';
import {
  HelperZodSchema,
  MatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';
import { O } from 'ts-toolbelt';
import { z } from 'zod';

/**
 * AppSync mapping template helper input
 */
export type AppSyncMappingTemplateInput = {
  template: string;
  context: O.Partial<
    AppSyncResolverEvent<Record<string, unknown>, Record<string, unknown>>,
    'deep'
  >;
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
