import {
  AdminConfirmSignUpCommand,
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClientConfig,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getCognitoClient } from './internal';

/**
 * Get credentials for an existing user.
 */
export const cognitoSignIn = async (params: {
  clientId: string;
  username: string;
  password: string;
  config?: CognitoIdentityProviderClientConfig;
}): Promise<AuthenticationResultType> => {
  const { clientId, username, password, config } = params;
  const client = getCognitoClient(config);
  const { AuthenticationResult } = await client.send(
    new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
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
    new SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      UserAttributes: attributes,
    }),
  );

  await client.send(
    new AdminConfirmSignUpCommand({
      Username: username,
      UserPoolId: userPoolId,
    }),
  );

  return cognitoSignIn({
    clientId,
    password,
    username,
    config,
  });
};
