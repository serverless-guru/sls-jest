import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import { BASE_PATH, SLS_JEST_TAG } from '../constants';
export * from './event-bridge';

interface IStackDetails {
  stackName: string;
  [key: string]: string | undefined;
}

export const getStackName = (stackSuffix: string) => {
  return `sls-jest-${process.env.SLS_JEST_TAG}-${stackSuffix}`;
};

export const getStackDetailsFilePath = (stackName: string) => {
  return `${BASE_PATH}/${stackName}.json`;
};

export const getStackDetails = (params: {
  stackSuffix: string;
  stackType: string;
  config: string;
}): IStackDetails => {
  const { stackSuffix, stackType, config } = params;

  if (!process.env.SLS_JEST_TAG) {
    throw new Error(
      'Environment variable "SLS_JEST_TAG" should be set in order to deploy the test stack',
    );
  }

  const stackName = getStackName(stackSuffix);
  const outputFileName = getStackDetailsFilePath(stackName);

  // If cache does not exist, deploy
  if (!fs.existsSync(outputFileName)) {
    deployStack({
      stackName,
      stackType,
      config,
    });
  }

  const stackDetails = JSON.parse(readFileSync(outputFileName, 'utf8'))?.[
    stackName
  ];

  if (!stackDetails) {
    throw new Error(`Could not find stack details for ${stackName}.`);
  }

  return {
    stackName: stackName,
    ...stackDetails,
  };
};

export const deployStack = (params: {
  stackName: string;
  stackType: string;
  config: string;
}) => {
  const { stackName, stackType, config } = params;

  const args = [
    'cdk',
    'deploy',
    '--all',
    '--app',
    `"npx sls-jest-deploy-stack"`,
    '--require-approval',
    'never',
    '--output',
    `${BASE_PATH}/cdk.out`,
    '--outputs-file',
    getStackDetailsFilePath(stackName),
    '-c',
    `tag=${process.env.SLS_JEST_TAG}`,
    '-c',
    `stackName=${stackName}`,
    '-c',
    `stackType=${stackType}`,
    '-c',
    `config=${config}`,
  ];

  const { error, status, stderr } = spawnSync('npx', args, {
    // Run CDK in the context of the sls-jest
    cwd: __dirname,
  });

  if (status !== 0 || error) {
    if (error) {
      throw error;
    }

    throw new Error(stderr.toString());
  }
};

export const destroyAllStacks = async (params: { tag: string }) => {
  // fetch stacks with the given tag
  const client = new CloudFormationClient({});
  let nextToken: string | undefined;
  const stackNames: string[] = [];

  do {
    const describeCommand = new DescribeStacksCommand({
      NextToken: nextToken,
    });
    const { NextToken, Stacks } = await client.send(describeCommand);
    nextToken = NextToken;

    Stacks?.forEach((stack) => {
      if (
        stack.Tags?.some(
          (tag) => tag.Key === SLS_JEST_TAG && tag.Value === params.tag,
        ) &&
        stack.StackName
      ) {
        stackNames.push(stack.StackName);
      }
    });
  } while (nextToken);

  if (stackNames.length > 0) {
    await Promise.all(
      stackNames.map(async (stackName) => {
        console.log(`Destroying stack ${stackName}`);
        await destroyStack({ stackName });
        const filePath = getStackDetailsFilePath(stackName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(getStackDetailsFilePath(stackName));
        }
      }),
    );
  }
};

export const destroyStack = async (params: { stackName: string }) => {
  const client = new CloudFormationClient({});
  const deleteCommand = new DeleteStackCommand({
    StackName: params.stackName,
  });
  return client.send(deleteCommand);
};
