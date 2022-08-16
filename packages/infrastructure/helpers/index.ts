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
  const deleteCommands = stacks?.map(
    (stack) =>
      new DeleteStackCommand({
        StackName: stack.StackName,
      }),
  );
  if (deleteCommands && deleteCommands.length > 0) {
    await Promise.all(deleteCommands.map((command) => client.send(command)));
  }
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
    EventBridgeSpyQueueUrl: outputs?.[stackName]?.EventBridgeSpyQueueUrl as
      | string
      | undefined,
    EventBridgeSpyLogGroupName: outputs?.[stackName]
      ?.EventBridgeSpyLogGroupName as string | undefined,
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
