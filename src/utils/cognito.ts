import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClientConfig,
} from '@aws-sdk/client-cognito-identity-provider';
import { getCognitoClient } from './internal';

/**
 * Sign in a user in cognito and return its credentials.
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
