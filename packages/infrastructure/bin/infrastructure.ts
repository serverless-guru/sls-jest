#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { SlsJestStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

const id = app.node.tryGetContext('id');
if (id === undefined || !(typeof id === 'string') || id.trim() === '') {
  throw new Error("Must pass a '-c id=<ID>' context parameter");
}

const eventBusName = app.node.tryGetContext('eventBusName') as string;

const deployEventBridgeSqsSpy = app.node.tryGetContext(
  'deployEventBridgeSqsSpy',
) as string;

const deployEventBridgeCloudwatchSpy = app.node.tryGetContext(
  'deployEventBridgeCloudwatchSpy',
) as string;

new SlsJestStack(app, `SlsJestStack-${id}`, {
  eventBridgeSpy: {
    eventBusName: eventBusName,
    sqs: deployEventBridgeSqsSpy === 'true' || false,
    cloudWatchLogs: deployEventBridgeCloudwatchSpy === 'true' || false,
  },
});
