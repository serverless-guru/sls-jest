import { helpers } from '@sls-jest/infrastructure';

export const deployTestResources = async () => {
  console.log('Deploying test resources');
  await helpers.deploy();
  console.log('Finished deploying test resources');
};

export const destroyTestResources = async () => {
  console.log('Started removing test resources');
  await helpers.destroy();
  console.log('Finished removing test resources');
};
