import {
  CloudWatchEventSpyConfig,
  CloudWatchLogsEventBridgeSpy,
} from './CloudWatchLogsEventSpy';
import { EventBridgeSpy } from './EventBridgeSpy';
import { SQSEventBridgeSpy, SqsEventSpyConfig } from './SqsEventBridgeSpy';

export type EventBridgeSpyParams =
  | {
      type: 'cloudWatchLogs';
      config: CloudWatchEventSpyConfig;
    }
  | {
      type: 'sqs';
      config: SqsEventSpyConfig;
    };

export const eventBridgeSpy = (
  params: EventBridgeSpyParams,
): EventBridgeSpy => {
  const { type, config } = params;

  let spy: EventBridgeSpy;

  if (type === 'cloudWatchLogs') {
    spy = new CloudWatchLogsEventBridgeSpy(config);
  } else if (type === 'sqs') {
    spy = new SQSEventBridgeSpy(config);
  } else {
    throw new Error(`Unknown eventBridgeSpy type: ${type}`);
  }

  spy.pollEvents();
  return spy;
};
