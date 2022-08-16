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
  const {
    tag = process.env.SLS_JEST_TAG,
    eventBusName,
    eventBusTestComponent,
  } = params;

  if (!tag) {
    throw new Error(
      'Either "tag" parameter should be passed or environment variable "SLS_JEST_TAG" should be set',
    );
  }

  let spy: EventBridgeSpy;

  const { stackName, outputs } = await helpers.deployEventBridgeSpyStack({
    tag,
    eventBusName,
    useCw: eventBusTestComponent?.type === 'cw',
  });

  if (eventBusTestComponent?.type === 'cw') {
    spy = new CloudWatchLogsEventBridgeSpy({
      ...eventBusTestComponent.config,
      logGroupName: outputs.EventBridgeSpyLogGroupName as string,
      stackName,
    });
  } else {
    // defaults to sqs
    spy = new SQSEventBridgeSpy({
      queueUrl: outputs.EventBridgeSpyQueueUrl as string,
      stackName,
    });
  }

  return spy;
};
