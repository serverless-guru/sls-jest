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

interface EventBridgeSpyStackProps extends StackProps {
  eventBusName: string;
  use?: 'sqs' | 'cw';
}

export class EventBridgeSpyStack extends Stack {
  public readonly cw?: LogGroup;
  public readonly queue?: Queue;

  constructor(scope: Construct, id: string, props?: EventBridgeSpyStackProps) {
    super(scope, id, props);

    const { eventBusName, use } = props || {};

    if (!eventBusName) {
      throw new Error('"eventBusName" prop is required');
    }

    const targets: events.IRuleTarget[] = [];

    if (use === 'cw') {
      this.cw = new LogGroup(this, 'EventBridgeSpyLogGroup', {
        // logGroupName: Stack.of(this).stackName,
        retention: RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      targets.push(new eventTargets.CloudWatchLogGroup(this.cw));

      new CfnOutput(this, 'EventBridgeSpyLogGroupName', {
        value: this.cw.logGroupName,
      });
    }
    // Note: defaults to sqs
    else {
      this.queue = new Queue(this, 'EventBridgeSpyQueue', {
        fifo: true,
        // queueName: `${Stack.of(this).stackName}.fifo`,
        visibilityTimeout: Duration.seconds(30),
        removalPolicy: RemovalPolicy.DESTROY,
        contentBasedDeduplication: true,
      });

      targets.push(
        new eventTargets.SqsQueue(this.queue, {
          messageGroupId: 'default',
        }),
      );

      new CfnOutput(this, 'EventBridgeSpyQueueUrl', {
        value: this.queue.queueUrl,
      });
    }

    new events.Rule(this, 'EventBridgeSpyRule', {
      targets,
      eventBus: events.EventBus.fromEventBusName(
        this,
        'EventBridgeSpyEventBus',
        eventBusName,
      ),
      // ruleName: `${Stack.of(this).stackName}-EventBridgeRuleName`,
      eventPattern: {
        account: [Stack.of(this).account],
      },
    });
  }
}
