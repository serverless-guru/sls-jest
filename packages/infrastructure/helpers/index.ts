import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SLS_JEST_TAG } from '../constants';
import { EventBridgeSpyStack } from '../lib/EventBridgeSpyStack';
import { ContextParameter } from '../utils';

export const destroyAllStacks = async (params: { tag: string }) => {
  // fetch stacks with the given tag
  const client = new CloudFormationClient({});
  const describeCommand = new DescribeStacksCommand({});
  const describeResult = await client.send(describeCommand);
  const stacks = describeResult.Stacks?.filter((stack) =>
    stack.Tags?.some(
      (tag) => tag.Key === SLS_JEST_TAG && tag.Value === params.tag,
    ),
  );

  // delete them
  const stackNames = stacks?.map((stack) => stack.StackName as string);

  if (stackNames && stackNames.length > 0) {
    await Promise.all(
      stackNames.map((stackName) => destroyStack({ stackName })),
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

export const deployEventBridgeSpyStack = (params: {
  tag: string;
  busName: string;
  adapter?: 'sqs' | 'cw';
}) => {
  const { tag, busName, adapter = 'sqs' } = params;

  if (!busName) {
    throw new Error('"busName" parameter is required');
  }

  console.log(`Deploying test stack`);

  const stackName = EventBridgeSpyStack.getStackName({
    tag,
    busName,
  });

  const args = [
    'deploy',
    stackName,
    '--require-approval',
    'never',
    '--outputs-file',
    './outputs.json',
    '-c',
    `tag=${tag}`,
    '-c',
    `eb-spies=${ContextParameter.ebSpies.toString([
      {
        busName,
        adapter,
      },
    ])}`,
  ];

  const { error, status, stderr } = spawnSync('cdk', args, {
    cwd: resolve(__dirname, '..'),
  });

  if (status !== 0 || error) {
    if (error) {
      throw error;
    }
    throw new Error(stderr.toString());
  }

  console.log(`Test stack is deployed successfully`);

  const outputs = JSON.parse(
    readFileSync(resolve(__dirname, '../outputs.json'), 'utf8'),
  );

  const queueUrl = outputs?.[stackName].EventBridgeSpyQueueUrl as
    | string
    | undefined;
  const logGroupName = outputs?.[stackName].EventBridgeSpyLogGroupName as
    | string
    | undefined;

  return {
    stackName,
    queueUrl,
    logGroupName,
  };
};
