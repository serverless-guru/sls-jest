#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import 'source-map-support/register';
import { SLS_JEST_TAG } from '../constants';
import { EventBridgeSpyStack } from '../lib/EventBridgeSpyStack';
import { ContextParameter } from '../utils';

const app = new cdk.App();

const tag = app.node.tryGetContext('tag') as string;
if (tag === undefined || !(typeof tag === 'string') || tag.trim() === '') {
  throw new Error("Must pass a '-c tag=<TAG>' context parameter");
}

const config = app.node.tryGetContext('config') as string | undefined;

const { adapter, busName } =
  ContextParameter.eventBridgeSpyConfig.parse(config);

const stackName = EventBridgeSpyStack.getStackName({
  tag,
  busName,
  adapter,
});

const stack = new EventBridgeSpyStack(app, stackName, {
  busName,
  adapter,
});

Tags.of(stack).add(SLS_JEST_TAG, tag);
