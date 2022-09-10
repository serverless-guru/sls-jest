import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';
import { z } from 'zod';
import { HelperZodSchema, MatcherHelper, validateInput } from './internal';

/**
 * AppSync VTL template helper
 */

export type VtlTemplateInput = {
  template: string;
  context: O.Partial<
    AppSyncResolverEvent<Record<string, unknown>, Record<string, unknown>>,
    'deep'
  >;
  clientConfig?: AppSyncClientConfig;
};

const vtlTemplateInputSchema: HelperZodSchema<typeof vtlMappingTemplate> = z
  .object({
    template: z.string(),
    context: z.object({}).passthrough(),
  })
  .passthrough();

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
