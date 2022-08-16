#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import 'source-map-support/register';
import { SLS_JEST_TAG } from '../constants';
import { EventBridgeSpyStack } from '../lib/EventBridgeSpyStack';

const app = new cdk.App();

const tag = app.node.tryGetContext('tag') as string;
if (tag === undefined || !(typeof tag === 'string') || tag.trim() === '') {
  throw new Error("Must pass a '-c tag=<TAG>' context parameter");
}

const eventBusNamesString = app.node.tryGetContext('event-bus-names') as string;
const eventBusNames = eventBusNamesString?.split(',') || [];

const useCW = app.node.tryGetContext('use-cw') as string;
eventBusNames.forEach((eventBusName) => {
  const stackName = EventBridgeSpyStack.getStackName({
    tag,
    eventBusName,
  });

  const stack = new EventBridgeSpyStack(app, stackName, {
    eventBusName,
    use: useCW === 'true' ? 'cw' : 'sqs',
  });

  Tags.of(stack).add(SLS_JEST_TAG, tag);
});
