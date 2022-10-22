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
