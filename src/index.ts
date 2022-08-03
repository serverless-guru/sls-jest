import { EventBridgeEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as matchers from './assertions/index';

export { matchers };
export * from './spies/eventBridge';

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

if (expect !== undefined) {
  expect.extend(matchers);
} else {
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-extended correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
}
