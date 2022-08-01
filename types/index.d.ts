import { EventBridgeEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveItem(key: DocumentClient.Key): R;
      toHaveItems(key: DocumentClient.Key[]): R;
      toHaveEventWithDetailType(type: string): R;
      toHaveEventTimes(times: number): R;
      toHaveEventWithDetailTypeTimes(type: string, times: number): R;
      toHaveEventMatching(
        expected: Partial<EventBridgeEvent<string, unknown>>,
      ): R;
      toHaveEventMatchingTimes(
        expected: Partial<EventBridgeEvent<string, unknown>>,
        times: number,
      ): R;
    }
  }
}
