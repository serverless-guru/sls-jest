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

/**
 * Sign in a user in cognito and return its credentials.
 *
 * @param {string} clientId The cognito user pool client id.
 * @param {string} userPoolId The cognito user pool id.
 * @param {string} username The cognito user username.
 * @param {string} password The cognito user password.
 * @param {CognitoIdentityProviderClientConfig} config An optional cognito client configuration.
 */
export const cognitoSignIn = async (params: {
  clientId: string;
  userPoolId: string;
  username: string;
  password: string;
  config?: CognitoIdentityProviderClientConfig;
}): Promise<AuthenticationResultType> => {
  const { clientId, userPoolId, username, password, config } = params;
  const client = getCognitoClient(config);

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
 * Create a new user in cognito, auto confirm it and return its credentials.
 *
 * @param {string} clientId The cognito user pool client id.
 * @param {string} userPoolId The cognito user pool id.
 * @param {string} username The cognito user username.
 * @param {string} password The cognito user password.
 * @param {AttributeType[]} attributes The cognito user attributes.
 * @param {CognitoIdentityProviderClientConfig} config An optional cognito client configuration.
 *
 */
export const cognitoSignUp = async (params: {
  clientId: string;
  userPoolId: string;
  username: string;
  password: string;
  attributes?: AttributeType[];
  config?: CognitoIdentityProviderClientConfig;
}): Promise<AuthenticationResultType> => {
  const { clientId, userPoolId, username, password, attributes, config } =
    params;
  const client = getCognitoClient(config);

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
    config,
  });
};

/**
 * Delete a user in cognito.
 *
 * @param {string} userPoolId The cognito user pool id.
 * @param {string} username The cognito user username.
 * @param {CognitoIdentityProviderClientConfig} config An optional cognito client configuration.
 */
export const cognitoDeleteUser = async (params: {
  userPoolId: string;
  username: string;
  config?: CognitoIdentityProviderClientConfig;
}): Promise<void> => {
  const { userPoolId, username, config } = params;
  const client = getCognitoClient(config);

  await client.send(
    new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    }),
  );
};
