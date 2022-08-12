#!/usr/bin/env node

import { program } from 'commander';

program.name('sls-jest').version('0.0.1').description('SLS Jest CLI');

program
  .command('deploy')
  .option('-e, --event-bus-names <names...>', 'Event bus names')
  .option('-c, --use-sqs', 'Use SQS Spy (default)')
  .option('-c, --use-cw', 'Use Cloudwatch Spy')
  .action(
    async (args: {
      eventBusNames?: string[];
      useSqs?: boolean;
      useCw?: boolean;
    }) => {
      console.log(args);
      // TODO
      // await helpers.deployEventBridgeSpyStack({
      //   eventBusName: args.eventBusNames[0],
      //   useCw: args.useCw,
      // });
    },
  );

program
  .command('destroy')
  .option('-e, --event-bus-names <names...>', 'Event bus names')
  .action(async (args: { eventBusNames?: string[] }) => {
    console.log('args', args);
    // TODO
    // await helpers.destroyEventBridgeSpyStack({
    //   id: args.id,
    // });
  });

program.parseAsync();
