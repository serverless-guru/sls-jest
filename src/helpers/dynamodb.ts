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
  /**
   * The DynamoDB table name.
   */
  tableName: string;
  /**
   * The DynamoDB item key.
   */
  key: GetCommandInput['Key'];
  /**
   * An optional DynamoDB SDK client configuration.
   */
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
 * Helper function that describes a DynamoDB Item to test.
 *
 * Use with {@link expect} and any compatible matcher.
 * @see https://serverlessguru.gitbook.io/sls-jest/matchers/dynamodb
 *
 * @param input {@link DynamodbItemInput}
 *
 * @example
 *
 * expect(dynamodbItem({
 *   tableName: 'users',
 *   key: {
 *     id: '1'
 *   }
 * })).toExist();
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
