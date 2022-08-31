import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { SLS_JEST_TAG } from '../constants';
import { EventBridgeSpyStack } from '../lib/EventBridgeSpyStack';
import { ContextParameter } from '../utils';
import * as fs from 'fs';

const BASE_PATH = `${process.cwd()}/.sls-jest`;

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

const getStackDetailsFilePath = (stackName: string) => {
  return `${BASE_PATH}/${stackName}.json`;
};

const getStackDetails = (stackName: string) => {
  const outputFileName = getStackDetailsFilePath(stackName);
  if (fs.existsSync(outputFileName)) {
    const stackDetails = JSON.parse(readFileSync(outputFileName, 'utf8'));

    const { LogGroupName: logGroupName, QueueUrl: queueUrl } =
      stackDetails?.[stackName] || {};

    if (logGroupName || queueUrl) {
      return {
        stackName,
        logGroupName,
        queueUrl,
      };
    }
  }

  return undefined;
};

export const deployEventBridgeSpyStack = (params: {
  tag: string;
  busName: string;
  adapter?: 'sqs' | 'cw';
}) => {
  const { tag, busName, adapter = 'sqs' } = params;

  if (!busName) {
    throw new Error('"busName" parameter is required');
  }

  const stackName = EventBridgeSpyStack.getStackName({
    tag,
    busName,
    adapter,
  });

  const stackDetails = getStackDetails(stackName);

  if (stackDetails) {
    return stackDetails;
  }

  const args = [
    'cdk',
    'deploy',
    '--all',
    '--app',
    '"npx sls-jest-eb-spy-stack"',
    '--require-approval',
    'never',
    '--output',
    `${BASE_PATH}/cdk.out`,
    '--outputs-file',
    getStackDetailsFilePath(stackName),
    '-c',
    `tag=${tag}`,
    '-c',
    `config=${ContextParameter.eventBridgeSpyConfig.toString({
      busName,
      adapter,
    })}`,
  ];

  const { error, status, stderr } = spawnSync('npx', args, {
    cwd: process.cwd(),
  });

  if (status !== 0 || error) {
    if (error) {
      throw error;
    }

    throw new Error(stderr.toString());
  }

  const deployedStackDetails = getStackDetails(stackName);

  if (!deployedStackDetails) {
    throw new Error(`Could not find stack details for ${stackName}.`);
  }

  return deployedStackDetails;
};
