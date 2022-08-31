import * as helpers from '@sls-jest/infrastructure/helpers';
import {
  CloudWatchEventSpyConfig,
  CloudWatchLogsEventBridgeSpy,
} from './CloudWatchLogsEventSpy';
import { EventBridgeSpy } from './EventBridgeSpy';
import { SQSEventBridgeSpy, SqsEventSpyConfig } from './SqsEventBridgeSpy';

export type { EventBridgeSpy } from './EventBridgeSpy';
export type EventBridgeSpyParams = {
  eventBusName: string;
} & (
  | {
      adapter: 'cw';
      config: Omit<CloudWatchEventSpyConfig, 'logGroupName'>;
    }
  | {
      adapter?: 'sqs';
      config: Omit<SqsEventSpyConfig, 'queueUrl'>;
    }
);

export const eventBridgeSpy = async (params: EventBridgeSpyParams) => {
  const { eventBusName, adapter, config } = params;

  const tag = process.env.SLS_JEST_TAG;

  if (!tag) {
    throw new Error(
      'Environment variable "SLS_JEST_TAG" should be set in order to deploy the test stack',
    );
  }

  let spy: EventBridgeSpy;

  const { stackName, logGroupName, queueUrl } =
    await helpers.deployEventBridgeSpyStack({
      tag,
      busName: eventBusName,
      adapter,
    });

  if (adapter === 'cw') {
    if (!logGroupName) {
      throw new Error('"logGroupName" parameter is required');
    }
    spy = new CloudWatchLogsEventBridgeSpy({
      ...config,
      logGroupName,
      stackName,
    });
  } else {
    // defaults to sqs
    if (!queueUrl) {
      throw new Error('"queueUrl" parameter is required');
    }
    spy = new SQSEventBridgeSpy({
      ...config,
      queueUrl,
      stackName,
    });
  }

  spy.startPolling();
  return spy;
};
