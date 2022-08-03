import {
  CloudWatchEventSpyParams,
  CloudWatchLogsEventBridgeSpy,
} from './CloudWatchLogsEventSpy';
import { EventBridgeSpy } from './EventBridgeSpy';
import { SQSEventBridgeSpy, SqsEventSpyParams } from './SqsEventBridgeSpy';

export type EventBridgeSpyParams =
  | {
      type: 'cloudWatchLogs';
      config: CloudWatchEventSpyParams;
    }
  | {
      type: 'sqs';
      config: SqsEventSpyParams;
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
