import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClientConfig,
} from '@aws-sdk/client-cognito-identity-provider';
import { getCognitoClient } from './internal';

type CognitoInput = {
  /**
   * An optional cognito client configuration.
   */
  clientConfig?: CognitoIdentityProviderClientConfig;
};

/**
 * Cognito Sign In input
 */
export type CognitoSignInInput = {
  /**
   * The cognito user pool id.
   */
  userPoolId: string;
  /**
   * The cognito user pool client id.
   */
  clientId: string;
  /**
   * The cognito user username.
   */
  username: string;
  /**
   * The cognito user password.
   */
  password: string;
} & CognitoInput;

/**
 * Sign in a user in cognito and return its credentials.
 *
 * @param input {@link CognitoSignInInput}
 */
export const cognitoSignIn = async (
  input: CognitoSignInInput,
): Promise<AuthenticationResultType> => {
  const { clientId, userPoolId, username, password, clientConfig } = input;
  const client = getCognitoClient(clientConfig);

  const { AuthenticationResult } = await client.send(
    new AdminInitiateAuthCommand({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: clientId,
      UserPoolId: userPoolId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }),
  );

  if (!AuthenticationResult) {
    throw new Error('AuthenticationResult is undefined');
  }

  return AuthenticationResult;
};

/**
 * Cognito Sign Up input
 */
export type CognitoSignUpInput = CognitoSignInInput & {
  /**
   * The cognito user attributes.
   */
  attributes?: AttributeType[];
};

/**
 * Create a new user in cognito, auto confirm it and return its credentials.
 *
 * @param input {@link CognitoSignUpInput}
 */
export const cognitoSignUp = async (
  input: CognitoSignUpInput,
): Promise<AuthenticationResultType> => {
  const { clientId, userPoolId, username, password, attributes, clientConfig } =
    input;
  const client = getCognitoClient(clientConfig);

  await client.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: username,
      DesiredDeliveryMediums: [],
      UserAttributes: attributes,
    }),
  );

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    }),
  );

  return cognitoSignIn({
    clientId,
    userPoolId,
    password,
    username,
    clientConfig,
  });
};

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
} & CognitoInput;

/**
 * Delete a user in cognito.
 *
 * @param input {@link CognitoUserInput}
 */
export const cognitoDeleteUser = async (
  input: CognitoUserInput,
): Promise<void> => {
  const { userPoolId, username, clientConfig } = input;
  const client = getCognitoClient(clientConfig);

  await client.send(
    new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    }),
  );
};
