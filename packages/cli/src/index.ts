#!/usr/bin/env node

import * as helpers from '@sls-jest/infrastructure/helpers';
import { program } from 'commander';

program.name('sls-jest').version('0.0.1').description('SLS Jest CLI');

program
  .command('destroy')
  .requiredOption('-t, --tag <tag>', 'Tag to use for the stack')
  .action(async (args: { tag: string }) => {
    await helpers.destroyAllStacks({
      tag: args.tag,
    });
  });

program.parseAsync();
