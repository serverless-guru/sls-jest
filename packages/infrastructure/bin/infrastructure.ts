#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { EventBridgeSpyStack } from '../lib/EventBridgeSpyStack';

const app = new cdk.App();

const eventBusNamesString = app.node.tryGetContext('event-bus-names') as string;

const eventBusNames = eventBusNamesString?.split(',') || [];

eventBusNames.forEach((eventBusName) => {
  const useCW = app.node.tryGetContext('use-cw') as string;

  new EventBridgeSpyStack(app, `sls-jest-eb-spy-${eventBusName}`, {
    eventBusName,
    use: useCW === 'true' ? 'cw' : 'sqs',
  });
});
