#!/usr/bin/env node

import { program } from 'commander';
import * as helpers from '@sls-jest/infrastructure/helpers';

program.name('sls-jest').version('0.0.1').description('SLS Jest CLI');

program
  .command('deploy')
  .option('-e, --event-bus-names <names...>', 'Event bus names')
  .option('-c, --use-cw', 'Use Cloudwatch Spy')
  .action(async (args: { eventBusNames?: string[]; useCw?: boolean }) => {
    await helpers.deployAllStacks({
      eventBusNames: args.eventBusNames || [],
      useCw: args.useCw || false,
    });
  });

program
  .command('destroy')
  .option('-e, --event-bus-names <names...>', 'Event bus names')
  .action(async (args: { eventBusNames?: string[] }) => {
    await helpers.destroyAllStacks({
      eventBusNames: args.eventBusNames || [],
    });
  });

program.parseAsync();
