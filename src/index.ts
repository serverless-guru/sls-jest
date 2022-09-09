import { EventBridgeEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export * as matchers from './matchers';
export * from './helpers/helpers';
export * from './spies';

declare global {
  namespace jest {
    interface Matchers<R> {
      toExist(): R;
      toExistAndMatchObject(params: DocumentClient.AttributeMap): R;
      toExistAndMatchSnapshot(propertiesOrHint?: string, hint?: string): R;
      toExistAndMatchInlineSnapshot(
        propertiesOrHint?: string,
        hint?: string,
      ): R;
      toHaveEventMatchingObject(
        expected: Partial<EventBridgeEvent<string, unknown>>,
      ): R;
      toHaveEventMatchingObjectTimes(
        expected: Partial<EventBridgeEvent<string, unknown>>,
        times: number,
      ): R;
      toEvaluateTo(template: string | object): R;
      toEvaluateToSnapshot(propertiesOrHint?: string, hint?: string): R;
      toEvaluateToInlineSnapshot(propertiesOrHint?: string, hint?: string): R;
    }
  }
}
