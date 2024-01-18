import { AppSyncClient, AppSyncClientConfig } from '@aws-sdk/client-appsync';
import { canonicalize } from 'json-canonicalize';

const appSyncClients: Record<string, AppSyncClient> = {};

export const getAppSyncClient = (config: AppSyncClientConfig = {}) => {
  const key = canonicalize(config);
  if (!appSyncClients[key]) {
    appSyncClients[key] = new AppSyncClient(config);
  }

  return appSyncClients[key];
};
