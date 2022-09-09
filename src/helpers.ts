import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import AsyncRetry from 'async-retry';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';

/**
 * General helpers
 * @internal
 */

type MatcherHelperInput<Name extends string, T> = T & {
  _itemType: Name;
};

type MatcherHelper<Name extends string, T> = (
  input: T,
) => MatcherHelperInput<Name, T>;

type RetryableMatcherHelper<Name extends string, T> = (
  input: T & Retryable,
) => MatcherHelperInput<Name, T & Retryable>;

type Retryable = {
  retryPolicy?: AsyncRetry.Options;
};

/**
 * DynamoDB Item helper
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

export const dynamodbItem: RetryableMatcherHelper<
  'dynamodb',
  DynamodbItemInput
> = (dynamoDbItem) => ({
  _itemType: 'dynamodb',
  ...dynamoDbItem,
});

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

export const vtlMappingTemplate: MatcherHelper<
  'vtlMappingTemplate',
  VtlTemplateInput
> = (mappingTemplate) => ({
  _itemType: 'vtlMappingTemplate',
  ...mappingTemplate,
});
