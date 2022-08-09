#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SlsJestStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

export type Context = {
  suffix: string;
};

const suffix = app.node.tryGetContext('suffix');
if (
  suffix === undefined ||
  !(typeof suffix === 'string') ||
  suffix.trim() === ''
) {
  throw new Error("Must pass a '-c suffix=<Suffix>' context parameter");
}

new SlsJestStack(app, `SlsJestStack-${suffix}`, {
  eventBridgeSpy: {
    // TODO make following parameters customizable
    sqs: false,
    cloudWatchLogs: false,
    eventBusName: 'default',
  },
});
