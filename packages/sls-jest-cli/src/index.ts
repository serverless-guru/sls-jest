#!/usr/bin/env node

import { helpers } from '@sls-jest/infrastructure';
import { program } from 'commander';

program.name('sls-jest').version('0.0.1').description('SLS Jest CLI');

program
  .command('deploy')
  .requiredOption('-t, --tag <tag>', 'Tag to use for the stack')
  .option('-e, --event-bus-names <names...>', 'Event bus names')
  .option('-c, --use-cw', 'Use Cloudwatch Spy')
  .action(
    async (args: {
      tag: string;
      eventBusNames?: string[];
      useCw?: boolean;
    }) => {
      await helpers.deployAllStacks({
        tag: args.tag,
        eventBusNames: args.eventBusNames || [],
        useCw: args.useCw || false,
      });
    },
  );

program
  .command('destroy')
  .requiredOption('-t, --tag <tag>', 'Tag to use for the stack')
  .action(async (args: { tag: string }) => {
    await helpers.destroyAllStacks({
      tag: args.tag,
    });
  });

program.parseAsync();
