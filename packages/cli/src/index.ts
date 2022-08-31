#!/usr/bin/env node

import * as helpers from '@sls-jest/infrastructure/helpers';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';

const pathName = fs.realpathSync(path.join(__dirname, '../package.json'));
const { version } = JSON.parse(fs.readFileSync(pathName, 'utf8'));

program
  .name('sls-jest')
  .version(version, '-v, --version', 'outputs the current version')
  .description('SLS Jest CLI');

program
  .command('destroy')
  .requiredOption('-t, --tag <tag>', 'Tag to use for the stack')
  .action(async (args: { tag: string }) => {
    await helpers.destroyAllStacks({
      tag: args.tag,
    });
  });

program.parseAsync();
