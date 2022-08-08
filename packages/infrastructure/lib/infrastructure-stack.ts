import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';

import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface SlsJestStackProps extends StackProps {
  eventBridgeSpy?: {
    sqs?: boolean;
    cloudWatchLogs?: boolean;
    eventBusName?: string;
    eventPattern?: events.EventPattern;
  };
}

export class SlsJestStack extends Stack {
  public readonly eventBridgeSpyLogGroupName?: LogGroup;
  public readonly eventBridgeSpyQueueUrl?: Queue;

  constructor(scope: Construct, id: string, props?: SlsJestStackProps) {
    super(scope, id, props);

    const { eventBridgeSpy } = props || {};

    const targets: events.IRuleTarget[] = [];
    if (eventBridgeSpy?.sqs) {
      const queue = new Queue(this, 'EventBridgeSpyQueue', {
        visibilityTimeout: Duration.seconds(30),
        fifo: true,
      });
      targets.push(
        new eventTargets.SqsQueue(queue, { messageGroupId: 'default' }),
      );
      this.eventBridgeSpyQueueUrl = queue;
      new CfnOutput(this, 'EventBridgeSpyQueueUrl', {
        value: queue.queueUrl,
        exportName: 'eventBridgeSpyQueueUrl',
      });
    }
    if (eventBridgeSpy?.cloudWatchLogs) {
      const logGroup = new LogGroup(this, 'EventBridgeSpyLogGroup', {
        retention: RetentionDays.ONE_DAY,
      });
      targets.push(new eventTargets.CloudWatchLogGroup(logGroup));
      this.eventBridgeSpyLogGroupName = logGroup;
      new CfnOutput(this, 'EventBridgeSpyLogGroupName', {
        value: logGroup.logGroupName,
        exportName: 'eventBridgeSpyLogGroupName',
      });
    }

    if (targets.length > 0) {
      new events.Rule(this, 'EventBridgeSpyRule', {
        targets,
        eventBus: events.EventBus.fromEventBusName(
          this,
          'EventBridgeSpyEventBus',
          eventBridgeSpy?.eventBusName || 'default',
        ),
        ruleName: 'sls-jest-event-bridge-spy',
        eventPattern: eventBridgeSpy?.eventPattern || {
          account: [Stack.of(this).account],
        },
      });
    }
  }
}
