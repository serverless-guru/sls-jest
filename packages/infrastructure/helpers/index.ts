import { spawnSync } from 'child_process';
import { resolve } from 'path';

export type DeployParams = {
  suffix: string;
};

export const deploy = (params: DeployParams) => {
  console.log('Deploying test resources');

  const { output, error, status, stderr } = spawnSync(
    'cdk',
    [
      'deploy',
      `SlsJestStack-${params.suffix}`, // explicitly set the stack name to avoid deploying another stack
      '--require-approval',
      'never',
      '-c',
      `suffix=${params.suffix}`,
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

  console.log('Test resources are deployed successfully');

  return output;
};

export type DestroyParams = {
  suffix: string;
};

export const destroy = (params: DestroyParams) => {
  console.log('Destroying test resources');

  const { output, error, status, stderr } = spawnSync(
    'cdk',
    [
      'destroy',
      `SlsJestStack-${params.suffix}`, // explicitly set the stack name to avoid destroying a wrong stack
      '--force',
      'never',
      '-c',
      `suffix=${params.suffix}`,
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

  return output;
};
