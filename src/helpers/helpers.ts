import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';
import { RetryableMatcherHelper, MatcherHelper } from './internal';

/**
 * DynamoDB Item helper
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

export const dynamodbItem: RetryableMatcherHelper<
  'dynamodbItem',
  DynamodbItemInput
> = (dynamoDbItem) => ({
  _helperName: 'dynamodbItem',
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
  _helperName: 'vtlMappingTemplate',
  ...mappingTemplate,
});
