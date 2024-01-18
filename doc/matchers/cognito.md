# Cognito

A collection of matchers that you can use to assert on Cognito users.

Use the `cognitoUser()` helper function to specify which Cognito User you are testing. It takes the following input parameters:

- `userPoolId`: The user pool id where the user should be found.
- `username`: The user id you are looking for
- `retryPolicy`: An optional [node-retry](https://github.com/tim-kos/node-retry) options config. `sls-jest` will retry using the given retry policy until the test passes or all the retries are exhausted. This is useful in an asynchronous context.

### `toExist()`

Asserts whether a Cognito user exists in the given user pool.

```typescript
await expect(
  cognitoUser({
    userPoolId: 'my-pool',
    username: 'user-1'
    },
  }),
).toExist();
```

### `toExistAndMatchObject<E>(expected: DeepPartial<E>)`

Asserts that a user exists in the given user pool, and matches a subset of the properties of an object. It works similarly to jest's [toMatchObject](https://jestjs.io/docs/expect#tomatchobjectobject).

```typescript
await expect(
  cognitoUser({
    userPoolId: 'my-pool',
    username: 'user-1'
  }),
).toExistAndMatchObject({
  Enabled: true,
  Username: 'user-1'
});
```

### `toExistAndMatchSnapshot<E>(propertyMatchers?: DeepPartial<E>, hint?: string)`

Asserts that a user exists in the given user pool, and that it matches the most recent snapshot. It works similarly to jest's [toMatchSnapshot](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint).

```typescript
await expect(
  cognitoUser({
    userPoolId: 'my-pool',
    username: 'user-1'
  }),
).toExistAndMatchSnapshot();
```

### `toExistAndMatchInlineSnapshot<E>(propertyMatchers?: DeepPartial<E>, hint?: string)`

Asserts that a user exists in the given user pool, and that it matches the most recent inline snapshot. It works similarly to jest's [toMatchInlineSnapshot](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot).

```typescript

await expect(
  cognitoUser({
    userPoolId: 'my-pool',
    username: 'user-1'
  }),
).toExistAndMatchInlineSnapshot(
  {
    Enabled: true,
    UserAttributes: expect.arrayContaining([
      {
        Name: 'email',
        Value: expect.any(String),
      },
    ]),
    UserCreateDate: expect.any(Date),
    UserLastModifiedDate: expect.any(Date),
    UserStatus: 'CONFIRMED',
    Username: expect.any(String),
  },
  `
  Object {
    "Enabled": true,
    "UserAttributes": ArrayContaining [
      Object {
        "Name": "email",
        "Value": Any<String>,
      },
    ],
    "UserCreateDate": Any<Date>,
    "UserLastModifiedDate": Any<Date>,
    "UserStatus": "CONFIRMED",
    "Username": Any<String>,
  }
`,
);
```
