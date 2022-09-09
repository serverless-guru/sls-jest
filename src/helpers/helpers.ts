import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';
import { RetryableMatcherHelper, MatcherHelper } from './internal';
import { z } from 'zod';

/**
 * Base schemas
 */
const object = z.object({}).passthrough().optional();

/**
 * Validate helper inputs
 */

const validateInput = (
  helperName: string,
  schema: z.ZodTypeAny,
  input: any,
) => {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  throw new Error(
    `${helperName}(): ${result.error.errors.map((e) => e.message).join(', ')}`,
  );
};

/**
 * DynamoDB Item helper
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

const dynamodbItemInputSchema: z.ZodType<DynamodbItemInput> = z.lazy(() =>
  z.object({
    tableName: z.string({
      required_error: 'tableName is required',
      invalid_type_error: 'tableName must be a string',
    }),
    key: z.record(z.string(), {
      required_error: 'key is required',
      invalid_type_error: 'key must be a valid DynamoDB key',
    }),
    clientConfig: object,
  }),
);

export const dynamodbItem: RetryableMatcherHelper<
  'dynamodbItem',
  DynamodbItemInput
> = (input) => {
  validateInput('dynamodbItem', dynamodbItemInputSchema, input);

  return {
    _helperName: 'dynamodbItem',
    ...input,
  };
};

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

const vtlTemplateInputSchema: z.ZodType<VtlTemplateInput> = z.lazy(() =>
  z.object({
    template: z.string({
      required_error: 'tableName is required',
      invalid_type_error: 'tableName must be a string',
    }),
    context: z.object({}),
    clientConfig: object,
  }),
);

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
