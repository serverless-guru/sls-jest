import { EventBridgeEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export * from './spies/eventBridge';
export * from './matchers/helpers';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveItem(key: DocumentClient.Key): R;
      toHaveItems(key: DocumentClient.Key[]): R;
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
