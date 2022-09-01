import { VtlTemplateInput } from './matchers/appSync';
import { DynamodbItemInput } from './matchers/dynamodb';

export const vtlMappingTemplate = (mappingTemplate: VtlTemplateInput) =>
  mappingTemplate;

export const dynamodbItem = (input: DynamodbItemInput) => input;
