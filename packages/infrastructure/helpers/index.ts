import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export type DeployParams = {
  id: string;
  eventBusName?: string;
  deployEventBridgeSqsSpy: boolean;
  deployEventBridgeCloudwatchSpy: boolean;
};

export const deploy = (params: DeployParams) => {
  console.log('Deploying test resources');

  const args = [
    'deploy',
    `SlsJestStack-${params.id}`, // explicitly set the stack name to avoid deploying another stack by mistake
    '--require-approval',
    'never',
    '--outputs-file',
    './outputs.json',
    '-c',
    `id=${params.id}`,
  ];

  if (params.eventBusName) {
    args.push('-c');
    args.push(`eventBusName=${params.eventBusName}`);

    if (params.deployEventBridgeSqsSpy) {
      args.push('-c');
      args.push('deployEventBridgeSqsSpy=true');
    }

    if (params.deployEventBridgeCloudwatchSpy) {
      args.push('-c');
      args.push('deployEventBridgeCloudwatchSpy=true');
    }
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

  console.log('Test resources are deployed successfully');

  const outputs = JSON.parse(
    readFileSync(resolve(__dirname, '../outputs.json'), 'utf8'),
  );

  return {
    EventBridgeSpyQueueUrl: outputs?.[`SlsJestStack-${params.id}`]
      ?.EventBridgeSpyQueueUrl as string | undefined,
    EventBridgeSpyLogGroupName: outputs?.[`SlsJestStack-${params.id}`]
      ?.EventBridgeSpyLogGroupName as string | undefined,
  };
};

export type DestroyParams = {
  id: string;
};

export const destroy = (params: DestroyParams) => {
  console.log('Destroying test resources');

  const { output, error, status, stderr } = spawnSync(
    'cdk',
    [
      'destroy',
      `SlsJestStack-${params.id}`, // explicitly set the stack name to avoid destroying a wrong stack
      '--force',
      'never',
      '-c',
      `id=${params.id}`,
    ],
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

  console.log('Test resources are destroyed successfully');

  return output.toString();
};
