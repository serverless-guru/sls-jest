import * as helpers from '@sls-jest/infrastructure/helpers';
import { EventBridgeSpy } from './spies/eventBridge';
import {
  CloudWatchEventSpyConfig,
  CloudWatchLogsEventBridgeSpy,
} from './spies/eventBridge/CloudWatchLogsEventSpy';
import {
  SQSEventBridgeSpy,
  SqsEventSpyConfig,
} from './spies/eventBridge/SqsEventBridgeSpy';

type EventBridgeConfig = {
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

// TODO find a better name for this class
export class EventBridge {
  private readonly config: EventBridgeConfig;

  queueUrl: string | undefined;
  logGroupName: string | undefined;
  spy: EventBridgeSpy | undefined;

  constructor(config: EventBridgeConfig) {
    this.config = config;
  }

  static async init(config: EventBridgeConfig) {
    const instance = new EventBridge(config);

    const useCw = instance.config.eventBusTestComponent?.type === 'cw';

    const { EventBridgeSpyQueueUrl, EventBridgeSpyLogGroupName } =
      await helpers.deployEventBridgeSpyStack({
        eventBusName: instance.config.eventBusName,
        useCw,
      });

    instance.queueUrl = EventBridgeSpyQueueUrl;
    instance.logGroupName = EventBridgeSpyLogGroupName;

    if (instance.config.eventBusTestComponent?.type === 'cw') {
      instance.spy = new CloudWatchLogsEventBridgeSpy({
        ...instance.config.eventBusTestComponent.config,
        logGroupName: instance.logGroupName as string,
      });
    } else if (instance.config.eventBusTestComponent?.type === 'sqs') {
      instance.spy = new SQSEventBridgeSpy({
        ...instance.config.eventBusTestComponent.config,
        queueUrl: instance.queueUrl as string,
      });
    }

    return instance;
  }

  public async destroy() {
    return helpers.destroyEventBridgeSpyStack({
      eventBusName: this.config.eventBusName,
    });
  }
}
