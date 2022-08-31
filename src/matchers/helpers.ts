import AsyncRetry from 'async-retry';
import { VtlTemplateInput } from './appSync';
import { DynamodbItemInput } from './dynamodb';

type Retryable = {
  retryPolicy?: AsyncRetry.Options;
};

export const vtlMappingTemplate = (mappingTemplate: VtlTemplateInput) =>
  mappingTemplate;

export const dynamodbItem = (input: DynamodbItemInput & Retryable) => input;
