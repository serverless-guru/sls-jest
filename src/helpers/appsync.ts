import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { AppSyncResolverEvent } from 'aws-lambda';
import { HelperZodSchema, MatcherHelper, validateInput } from './internal';
import { O } from 'ts-toolbelt';
import { z } from 'zod';

/**
 * AppSync VTL template helper input
 */
export type VtlTemplateInput = {
  template: string;
  context: O.Partial<
    AppSyncResolverEvent<Record<string, unknown>, Record<string, unknown>>,
    'deep'
  >;
  clientConfig?: AppSyncClientConfig;
};

/**
 * VTL Template schema
 */
const vtlTemplateInputSchema: HelperZodSchema<typeof vtlMappingTemplate> =
  z.object({
    template: z.string(),
    context: z.object({}),
  });

/**
 * AppSync VTL template helper
 */
export const vtlMappingTemplate: MatcherHelper<
  'vtlMappingTemplate',
  VtlTemplateInput
> = (input) => {
  validateInput('vtlMappingTemplate', vtlTemplateInputSchema, input);

  return {
    _helperName: 'vtlMappingTemplate',
    ...input,
  };
};
