import { CognitoIdentityProviderClientConfig } from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import {
  assertMatcherHelperInputValue,
  HelperZodSchema,
  RetryableMatcherHelper,
} from './internal';

/**
 * Cognito User helper input
 */
export type CognitoUserInput = {
  userPoolId: string;
  username: string;
  clientConfig?: CognitoIdentityProviderClientConfig;
};

/**
 * Cognito User schema
 */
const cognitoUserInputSchema: HelperZodSchema<typeof cognitoUser> = z.object({
  userPoolId: z.string(),
  username: z.string(),
});

/**
 * Cognito User helper
 */
export const cognitoUser: RetryableMatcherHelper<
  'cognitoUser',
  CognitoUserInput
> = (input) => {
  assertMatcherHelperInputValue('cognitoUser', cognitoUserInputSchema, input);

  return {
    _slsJestHelperName: 'cognitoUser',
    ...input,
  };
};
