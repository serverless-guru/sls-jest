import { AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda';
import { O } from 'ts-toolbelt';

/**
 * DynamoDB Item helper
 */
export type DynamodbItemInput = {
  tableName: string;
  key: GetCommandInput['Key'];
  clientConfig?: DynamoDBClientConfig;
};

export const dynamodbItem = (input: DynamodbItemInput) => input;

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

export const vtlMappingTemplate = (mappingTemplate: VtlTemplateInput) =>
  mappingTemplate;
