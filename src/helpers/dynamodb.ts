import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import {
  HelperZodSchema,
  RetriableMatcherHelper,
  assertMatcherHelperInputValue,
} from './internal';

/**
 * DynamoDB Item helper input
 *
 * @param {string} tableName The DynamoDB table name.
 * @param {object} key The DynamoDB item key.
 * @param {object} clientConfig An optional DynamoDB SDK client configuration.
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
export const dynamodbItem: RetriableMatcherHelper<
  'dynamodbItem',
  DynamodbItemInput
> = (input) => {
  assertMatcherHelperInputValue('dynamodbItem', dynamodbItemInputSchema, input);

  return {
    _slsJestHelperName: 'dynamodbItem',
    ...input,
  };
};
