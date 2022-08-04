import { AppSyncClient, AppSyncClientConfig } from '@aws-sdk/client-appsync';

export const maybeParseJson = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
};
