#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventBridgeSpyStack } from '../infrastructure/stacks/EventBridgeSpyStack';

const app = new cdk.App();

const stackName = app.node.tryGetContext('stackName') as string | undefined;
if (!stackName) {
  throw new Error("Must pass a '-c stackName=<stackName>' context parameter");
}

const stackType = app.node.tryGetContext('stackType') as string | undefined;
if (!stackType) {
  throw new Error("Must pass a '-c stackType=<stackType>' context parameter");
}

if (stackType === 'eventBridgeSpy') {
  new EventBridgeSpyStack(app, stackName);
}
