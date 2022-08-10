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

type SlsJestConfig = {
  id: string;
  eventBusName?: string;
  eventBusTestComponent?:
    | {
        type: 'cloudwatch';
        config: Omit<CloudWatchEventSpyConfig, 'logGroupName'>;
      }
    | {
        type: 'sqs';
        config: Omit<SqsEventSpyConfig, 'queueUrl'>;
      };
};

export class SlsJest {
  private readonly config: SlsJestConfig;

  eventBridgeSpyQueueUrl: string | undefined;
  eventBridgeSpyLogGroupName: string | undefined;
  eventBridgeSpy: EventBridgeSpy | undefined;

  constructor(config: SlsJestConfig) {
    this.config = config;
  }

  static async create(config: SlsJestConfig) {
    const instance = new SlsJest(config);

    const deployEventBridgeCloudwatchSpy = instance.config.eventBusName
      ? instance.config.eventBusTestComponent?.type === 'cloudwatch'
      : false;

    const deployEventBridgeSqsSpy = instance.config.eventBusName
      ? instance.config.eventBusTestComponent?.type === 'sqs'
      : false;

    const { EventBridgeSpyQueueUrl, EventBridgeSpyLogGroupName } =
      await helpers.deploy({
        id: instance.config.id,
        eventBusName: instance.config.eventBusName,
        deployEventBridgeCloudwatchSpy,
        deployEventBridgeSqsSpy,
      });

    instance.eventBridgeSpyQueueUrl = EventBridgeSpyQueueUrl;
    instance.eventBridgeSpyLogGroupName = EventBridgeSpyLogGroupName;

    if (instance.config.eventBusTestComponent?.type === 'cloudwatch') {
      instance.eventBridgeSpy = new CloudWatchLogsEventBridgeSpy({
        ...instance.config.eventBusTestComponent.config,
        logGroupName: instance.eventBridgeSpyLogGroupName as string,
      });
    } else if (instance.config.eventBusTestComponent?.type === 'sqs') {
      instance.eventBridgeSpy = new SQSEventBridgeSpy({
        ...instance.config.eventBusTestComponent.config,
        queueUrl: instance.eventBridgeSpyQueueUrl as string,
      });
    }

    return instance;
  }

  public async destroy() {
    return helpers.destroy({
      id: this.config.id,
    });
  }
}
