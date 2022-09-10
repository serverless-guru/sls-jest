import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';
import { z } from 'zod';
import { HelperZodSchema, MatcherHelper } from './internal';

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
    template: z.string({
      required_error: 'tableName is required',
      invalid_type_error: 'tableName must be a string',
    }),
    context: z.object({}),
  })
  .passthrough();

export const vtlMappingTemplate: MatcherHelper<
  'vtlMappingTemplate',
  VtlTemplateInput
> = (input) => {
  vtlTemplateInputSchema.parse(input);

  return {
    _helperName: 'vtlMappingTemplate',
    ...input,
  };
};
