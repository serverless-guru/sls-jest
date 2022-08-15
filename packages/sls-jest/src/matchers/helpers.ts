import { VtlTemplateInput } from './appSync';
import { DynamodbItemInput } from './dynamodb';

export const vtlMappingTemplate = (mappingTemplate: VtlTemplateInput) =>
  mappingTemplate;

export const dynamodbItem = (input: DynamodbItemInput) => input;
