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
  /**
   * The cognito user pool id.
   */
  userPoolId: string;
  /**
   * The cognito user username.
   */
  username: string;
  /**
   * An optional cognito client configuration.
   */
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
 * Helper function that describes a Cognito User to test.
 *
 * Use with {@link expect} and any compatible matcher.
 *
 * @param input {@link CognitoUserInput}
 *
 * @example
 *
 * expect(cognitoUser({
 *   userPoolId: 'us-east-1_123456789',
 *   username: 'john'
 * })).toExist();
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
