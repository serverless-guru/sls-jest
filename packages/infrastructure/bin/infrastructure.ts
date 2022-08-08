#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SlsJestStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

new SlsJestStack(app, 'SlsJestStack', {
  eventBridgeSpy: {
    sqs: true,
    cloudWatchLogs: true,
    eventBusName: 'default',
  },
});
