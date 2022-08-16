import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { z } from 'zod';

export interface EventBridgeSpyStackProps extends StackProps {
  busName: string;
  adapter?: 'sqs' | 'cw';
}

export class EventBridgeSpyStack extends Stack {
  public readonly cw?: LogGroup;
  public readonly queue?: Queue;

  constructor(scope: Construct, id: string, props?: EventBridgeSpyStackProps) {
    super(scope, id, props);

    const { busName, adapter } = props || {};

    if (!busName) {
      throw new Error('"busName" parameter is required');
    }

    const targets: events.IRuleTarget[] = [];

    if (adapter === 'cw') {
      this.cw = new LogGroup(this, 'EventBridgeSpyLogGroup', {
        retention: RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      targets.push(new eventTargets.CloudWatchLogGroup(this.cw));

      new CfnOutput(this, 'EventBridgeSpyLogGroupName', {
        value: this.cw.logGroupName,
      });
    } else {
      // defaults to sqs
      this.queue = new Queue(this, 'EventBridgeSpyQueue', {
        fifo: true,
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
        busName,
      ),
      eventPattern: {
        account: [Stack.of(this).account],
      },
    });
  }

  static getStackName(params: { tag: string; busName: string }): string {
    return `sls-jest-${params.tag}-eb-spy-${params.busName}`;
  }
}
