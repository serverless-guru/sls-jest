# Cognito

## Functions

### `cognitoSignUp`

Create a new user in cognito, auto confirm it and return its credentials.

example:

```typescript
const credentials = await cognitoSignUp({
  clientId: 'client_id',
  userPoolId: 'user_pool_id',
  username: 'someone@example.com',
  password: 'my_password',
  attributes: [
    {
      Name: 'email',
      Value: 'someone@example.com',
    },
  ],
});

// credentials = {AccessToken: string, IdToken: string, ...}
```

The returned value is of type [AuthenticationResultType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html) from @aws-sdk/client-cognito-identity-provider.

Note: this function is not idempotent, if the user already exists it will fail.

### `cognitoSignIn`

Sign in a user in cognito and return its credentials.

```typescript
const credentials = await cognitoSignIn({
  clientId: 'client_id',
  userPoolId: 'user_pool_id',
  username: 'someone@example.com',
  password: 'my_password',
});

// credentials = {AccessToken: string, IdToken: string, ...}
```

The returned value is of type [AuthenticationResultType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AuthenticationResultType.html) from @aws-sdk/client-cognito-identity-provider.

### `deleteCognitoUser`

Delete a user in cognito.

```typescript
await deleteCognitoUser({
  userPoolId: 'user_pool_id',
  username: 'someone@example.com',
});
```
