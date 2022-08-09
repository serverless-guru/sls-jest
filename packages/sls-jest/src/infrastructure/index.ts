import { helpers } from '@sls-jest/infrastructure';

export const deployTestResources = async (params: helpers.DeployParams) =>
  helpers.deploy(params);

export const destroyTestResources = async (params: helpers.DestroyParams) =>
  helpers.destroy(params);
