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
import { ContextParametersManager } from '../context-parameters-manager';
import { SlsJestStack } from './SlsJestStack';

export class EventBridgeSpyStack extends SlsJestStack {
  public readonly cw?: LogGroup;
  public readonly queue?: Queue;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const config = scope.node.tryGetContext('config') as string | undefined;

    const { adapter, busName } =
      ContextParametersManager.eventBridgeSpyConfig.parse(config);

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

      new CfnOutput(this, 'LogGroupName', {
        value: this.cw.logGroupName,
      });
    } else {
      // defaults to sqs
      this.queue = new Queue(this, 'Queue', {
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

      new CfnOutput(this, 'QueueUrl', {
        value: this.queue.queueUrl,
      });
    }

    new events.Rule(this, 'Rule', {
      targets,
      eventBus: events.EventBus.fromEventBusName(this, 'EventBus', busName),
      eventPattern: {
        account: [Stack.of(this).account],
      },
    });
  }
}
