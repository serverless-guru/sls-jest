import { EventBridgeEvent } from 'aws-lambda';
import { toHaveItemParams } from './matchers';

export * from './spies/eventBridge';
export * from './matchers/helpers';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveItem(params: toHaveItemParams): R;
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
