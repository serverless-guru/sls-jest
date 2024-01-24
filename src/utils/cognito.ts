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
   * An optional Cognito Identity Provider SDK client configuration.
   */
  clientConfig?: CognitoIdentityProviderClientConfig;
};

/**
 * Cognito Sign In input
 */
export type SignInWithCognitoUserInput = {
  /**
   * The Cognito user pool id.
   */
  userPoolId: string;
  /**
   * The Cognito user pool client id.
   */
  clientId: string;
  /**
   * The Cognito user username.
   */
  username: string;
  /**
   * The Cognito user password.
   */
  password: string;
} & CognitoInput;

/**
 * Sign in a user in Cognito and return its credentials.
 *
 * @param input {@link SignInWithCognitoUserInput}
 */
export const signInWithCognitoUser = async (
  input: SignInWithCognitoUserInput,
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
export type SignUpCognitoUserInput = SignInWithCognitoUserInput & {
  /**
   * The Cognito user attributes.
   */
  attributes?: AttributeType[];
};

/**
 * Create a new user in Cognito, auto confirm it and return its credentials.
 *
 * @param input {@link SignUpCognitoUserInput}
 */
export const signUpCognitoUser = async (
  input: SignUpCognitoUserInput,
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

  return signInWithCognitoUser({
    clientId,
    userPoolId,
    password,
    username,
    clientConfig,
  });
};

/**
 * Cognito Delete User input
 */
export type DeleteCognitoUserInput = {
  /**
   * The Cognito user pool id.
   */
  userPoolId: string;
  /**
   * The Cognito user username.
   */
  username: string;
  /**
   * An optional Cognito client configuration.
   */
  clientConfig?: CognitoIdentityProviderClientConfig;
} & CognitoInput;

/**
 * Delete a user from Cognito.
 *
 * @param input {@link DeleteCognitoUserInput}
 */
export const deleteCognitoUser = async (
  input: DeleteCognitoUserInput,
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
