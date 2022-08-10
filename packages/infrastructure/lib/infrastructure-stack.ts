import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface SlsJestStackProps extends StackProps {
  eventBridgeSpy?: {
    sqs?: boolean;
    cloudWatchLogs?: boolean;
    eventBusName?: string;
  };
}

export class SlsJestStack extends Stack {
  public readonly eventBridgeSpyLogGroup?: LogGroup;
  public readonly eventBridgeSpyQueue?: Queue;

  constructor(scope: Construct, id: string, props?: SlsJestStackProps) {
    super(scope, id, props);

    const { eventBridgeSpy } = props || {};

    if (eventBridgeSpy?.eventBusName) {
      const targets: events.IRuleTarget[] = [];
      if (eventBridgeSpy?.sqs) {
        this.eventBridgeSpyQueue = new Queue(this, 'EventBridgeSpyQueue', {
          fifo: true,
          queueName: `${Stack.of(this).stackName}.fifo`,
          visibilityTimeout: Duration.seconds(30),
          removalPolicy: RemovalPolicy.DESTROY,
          contentBasedDeduplication: true,
        });

        targets.push(
          new eventTargets.SqsQueue(this.eventBridgeSpyQueue, {
            messageGroupId: 'default',
          }),
        );

        new CfnOutput(this, 'EventBridgeSpyQueueUrl', {
          value: this.eventBridgeSpyQueue.queueUrl,
        });
      }
      if (eventBridgeSpy?.cloudWatchLogs) {
        this.eventBridgeSpyLogGroup = new LogGroup(
          this,
          'EventBridgeSpyLogGroup',
          {
            logGroupName: Stack.of(this).stackName,
            retention: RetentionDays.ONE_DAY,
            removalPolicy: RemovalPolicy.DESTROY,
          },
        );

        targets.push(
          new eventTargets.CloudWatchLogGroup(this.eventBridgeSpyLogGroup),
        );

        new CfnOutput(this, 'EventBridgeSpyLogGroupName', {
          value: this.eventBridgeSpyLogGroup.logGroupName,
        });
      }

      if (targets.length > 0) {
        new events.Rule(this, 'EventBridgeSpyRule', {
          targets,
          eventBus: events.EventBus.fromEventBusName(
            this,
            'EventBridgeSpyEventBus',
            eventBridgeSpy.eventBusName,
          ),
          ruleName: `${Stack.of(this).stackName}-EventBridgeRuleName`,
          eventPattern: {
            account: [Stack.of(this).account],
          },
        });
      }
    }
  }
}
