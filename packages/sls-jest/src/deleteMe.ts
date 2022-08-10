// TODO delete file after test

/**
 * This is test file to make sure that the infrastructure functions are working.
 * Running "ts-node ./packages/sls-jest/src/deleteMe.ts" will deploy then destroy the app 🔥
 */

import { SlsJest } from './index';

const run = async () => {
  const slsJest = await SlsJest.create({
    id: 'nice123',
    eventBusName: 'dev-sls-jest-playground-Bus',
    eventBusTestComponent: {
      type: 'cloudwatch',
      config: {
        clientConfig: {
          region: 'us-east-1',
        },
      },
    },
  });

  await slsJest.destroy();
};

run().catch((error) => console.error('something wrong happened', error));
