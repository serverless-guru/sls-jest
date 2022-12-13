import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import {
  HelperZodSchema,
  RetryableMatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';

/**
 * DynamoDB Item helper input
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

/**
 * DynamoDB Item schema
 */
const dynamodbItemInputSchema: HelperZodSchema<typeof dynamodbItem> = z.object({
  tableName: z.string(),
  key: z.record(z.string()),
});

/**
 * DynamoDB Item helper
 */
export const dynamodbItem: RetryableMatcherHelper<
  'dynamodbItem',
  DynamodbItemInput
> = (input) => {
  assertMatcherHelperInputValue('dynamodbItem', dynamodbItemInputSchema, input);

  return {
    _slsJestHelperName: 'dynamodbItem',
    ...input,
  };
};

/**
 * DynamoDB Query items helper input
 */
export type DynamodbQueryItemsInput = {
  tableName: string;
  indexName?: string;
  pk: string;
  sk?: {
    beginsWith?: string;
    between?: [string, string];
  };
  clientConfig?: DynamoDBClientConfig;
};

/**
 * DynamoDB Item schema
 */
const dynamodbQueryItemsInputSchema: HelperZodSchema<
  typeof dynamodbQueryItems
> = z.object({
  tableName: z.string(),
  indexName: z.string().optional(),
  pk: z.string(),
  sk: z
    .object({
      beginsWith: z.string().optional(),
      between: z.tuple([z.string(), z.string()]).optional(),
    })
    .optional(),
});

/**
 * DynamoDB Query items helper
 */
export const dynamodbQueryItems: RetryableMatcherHelper<
  'dynamodbQueryItems',
  DynamodbQueryItemsInput
> = (input) => {
  assertMatcherHelperInputValue(
    'dynamodbQueryItems',
    dynamodbQueryItemsInputSchema,
    input,
  );

  return {
    _slsJestHelperName: 'dynamodbQueryItems',
    ...input,
  };
};
