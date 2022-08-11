#!/usr/bin/env node

import * as helpers from '@sls-jest/infrastructure/helpers';
import { program } from 'commander';

program.name('sls-jest').version('0.0.1').description('SLS Jest CLI');

program
  .command('deploy')
  .requiredOption('-i, --id <id>', 'ID')
  .option('-e, --event-bus-name <name>', 'Event bus name')
  .option('-s, --use-sqs', 'Use SQS Spy')
  .option('-c, --use-cw', 'Use Cloudwatch Spy')
  .action(
    async (args: {
      id: string;
      eventBusName?: string;
      useSqs?: boolean;
      useCw?: boolean;
    }) => {
      await helpers.deploy({
        id: args.id,
        eventBusName: args.eventBusName,
        deployEventBridgeSqsSpy: (args.eventBusName && args.useSqs) || false,
        deployEventBridgeCloudwatchSpy:
          (args.eventBusName && args.useCw) || false,
      });
    },
  );

program
  .command('destroy')
  .requiredOption('-i, --id <id>', 'ID')
  .action(async (args: { id: string }) => {
    await helpers.destroy({
      id: args.id,
    });
  });

program.parseAsync();
