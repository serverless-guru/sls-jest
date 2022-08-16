import * as helpers from '@sls-jest/infrastructure/helpers';
import {
  CloudWatchEventSpyConfig,
  CloudWatchLogsEventBridgeSpy,
} from './CloudWatchLogsEventSpy';
import { EventBridgeSpy } from './EventBridgeSpy';
import { SQSEventBridgeSpy, SqsEventSpyConfig } from './SqsEventBridgeSpy';

export type { EventBridgeSpy } from './EventBridgeSpy';
export type EventBridgeSpyParams = {
  tag?: string;
  eventBusName: string;
  eventBusTestComponent?:
    | {
        type: 'cw';
        config: Omit<CloudWatchEventSpyConfig, 'logGroupName'>;
      }
    | {
        type: 'sqs';
        config: Omit<SqsEventSpyConfig, 'queueUrl'>;
      };
};

export const eventBridgeSpy = async (params: EventBridgeSpyParams) => {
  const { eventBusName, eventBusTestComponent } = params;

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
      adapter: eventBusTestComponent?.type,
    });

  if (eventBusTestComponent?.type === 'cw') {
    if (!logGroupName) {
      throw new Error('"logGroupName" parameter is required');
    }
    spy = new CloudWatchLogsEventBridgeSpy({
      ...eventBusTestComponent.config,
      logGroupName,
      stackName,
    });
  } else {
    // defaults to sqs
    if (!queueUrl) {
      throw new Error('"queueUrl" parameter is required');
    }
    spy = new SQSEventBridgeSpy({
      queueUrl,
      stackName,
    });
  }

  return spy;
};
