import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import {
  HelperZodSchema,
  RetryableMatcherHelper,
  validateInput,
} from './internal';

/**
 * DynamoDB Item
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

/**
 * DynamoDB Item schema
 */
const dynamodbItemInputSchema: HelperZodSchema<typeof dynamodbItem> = z
  .object({
    tableName: z.string({
      required_error: 'tableName is required',
      invalid_type_error: 'tableName must be a string',
    }),
    key: z.record(z.string(), {
      required_error: 'key is required',
      invalid_type_error: 'key must be a valid DynamoDB key',
    }),
  })
  .passthrough();

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
