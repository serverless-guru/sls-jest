import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export type DeployEventBridgeSpyStackParams = {
  eventBusName: string;
  useCw?: boolean;
};

export const deployEventBridgeSpyStack = (
  params: DeployEventBridgeSpyStackParams,
) => {
  const { eventBusName, useCw } = params;

  if (!eventBusName) {
    throw new Error('"eventBusName" parameter is required');
  }

  console.log(`Deploying test stack "sls-jest-eb-spy-${eventBusName}"`);

  const args = [
    'deploy',
    `sls-jest-eb-spy-${eventBusName}`,
    '--require-approval',
    'never',
    '--outputs-file',
    './outputs.json',
    '-c',
    `event-bus-names=${eventBusName}`,
  ];

  if (useCw) {
    args.push('-c');
    args.push('use-cw=true');
  }

  const { error, status, stderr } = spawnSync('cdk', args, {
    cwd: resolve(__dirname, '..'),
  });

  if (status !== 0 || error) {
    if (error) {
      throw error;
    }
    throw new Error(stderr.toString());
  }

  console.log(
    `Test stack "sls-jest-eb-spy-${eventBusName}" is deployed successfully`,
  );

  const outputs = JSON.parse(
    readFileSync(resolve(__dirname, '../outputs.json'), 'utf8'),
  );

  return {
    EventBridgeSpyQueueUrl: outputs?.[`sls-jest-eb-spy-${eventBusName}`]
      ?.EventBridgeSpyQueueUrl as string | undefined,
    EventBridgeSpyLogGroupName: outputs?.[`sls-jest-eb-spy-${eventBusName}`]
      ?.EventBridgeSpyLogGroupName as string | undefined,
  };
};

export type DestroyEventBridgeSpyStackParams = {
  eventBusName: string;
};

export const destroyEventBridgeSpyStack = (
  params: DestroyEventBridgeSpyStackParams,
) => {
  const { eventBusName } = params;

  if (!eventBusName) {
    throw new Error('"eventBusName" parameter is required');
  }

  console.log(`Destroying test stack "sls-jest-eb-spy-${eventBusName}"`);

  const { output, error, status, stderr } = spawnSync(
    'cdk',
    ['destroy', '-c', `event-bus-names=${eventBusName}`, '--force'],
    {
      cwd: resolve(__dirname, '..'),
    },
  );

  if (status !== 0 || error) {
    if (error) {
      throw error;
    }
    throw new Error(stderr.toString());
  }

  console.log(
    `Test stack "sls-jest-eb-spy-${eventBusName}" is destroyed successfully`,
  );

  return output.toString();
};
