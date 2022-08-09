// TODO delete file after test

/**
 * This is test file to make sure that the infrastructure functions are working.
 * Running "ts-node ./packages/sls-jest/src/deleteMe.ts" will deploy then destroy the app 🔥
 */

import { infrastructure } from './index';

const run = async () => {
  await infrastructure.deployTestResources({
    suffix: 'nice123',
  });
  await infrastructure.destroyTestResources({
    suffix: 'nice123',
  });
};

run().catch((error) => console.error('something wrong happened', error));
