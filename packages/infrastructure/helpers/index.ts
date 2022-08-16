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

export const deployAllStacks = (params: {
  tag: string;
  eventBusNames: string[];
  useCw?: boolean;
}) => {
  const { tag, eventBusNames, useCw } = params;

  console.log('Deploying all test stacks');

  const args = [
    'deploy',
    '--all',
    '--require-approval',
    'never',
    '--outputs-file',
    './outputs.json',
    '-c',
    `tag=${tag}`,
  ];

  if (eventBusNames.length > 0) {
    args.push('-c', `event-bus-names=${eventBusNames.join(',')}`);
  }

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

  console.log(`All test stack are deployed successfully`);

  const outputs = JSON.parse(
    readFileSync(resolve(__dirname, '../outputs.json'), 'utf8'),
  );

  return outputs;
};

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
  eventBusName: string;
  useCw?: boolean;
}) => {
  const { tag, eventBusName, useCw } = params;

  if (!eventBusName) {
    throw new Error('"eventBusName" parameter is required');
  }

  console.log(`Deploying test stack`);

  const stackName = EventBridgeSpyStack.getStackName({
    tag,
    eventBusName,
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

  console.log(`Test stack is deployed successfully`);

  const outputs = JSON.parse(
    readFileSync(resolve(__dirname, '../outputs.json'), 'utf8'),
  );

  return {
    stackName,
    outputs: outputs?.[stackName] as {
      EventBridgeSpyQueueUrl?: string;
      EventBridgeSpyLogGroupName?: string;
    },
  };
};

export const destroyEventBridgeSpyStack = (params: {
  tag: string;
  eventBusName: string;
}) => {
  const { tag, eventBusName } = params;

  if (!eventBusName) {
    throw new Error('"eventBusName" parameter is required');
  }

  console.log(`Destroying test stack`);

  const stackName = EventBridgeSpyStack.getStackName({
    tag,
    eventBusName,
  });

  const { output, error, status, stderr } = spawnSync(
    'cdk',
    [
      'destroy',
      stackName,
      '--force',
      '-c',
      `tag=${tag}`,
      '-c',
      `event-bus-names=${eventBusName}`,
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

  console.log(`Test stack is destroyed successfully`);

  return output.toString();
};
