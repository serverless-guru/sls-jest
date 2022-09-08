# Purpose

Testing serverless applications is hard. Ideally, you want to test agains the real infrastrucutre and avoid mocks. e.g. a real DynamoDB table, real Lambda functions. However, the asynchronous nature of serverless can makes it difficult to write tests that work and are deterministic.

This library offers a few tools that will help you solve, or at least mitigate, those issues. It is built on top of the famous [jest](https://jestjs.io/docs/getting-started) library and adds useful serverless-related matchers.

# Installing sls-jest

```bash
npm i sls-jest
```

# Setup Jest

Create a setup file:

```ts
// setupJest.ts
import { matchers } from 'sls-jest';

expect.extend(matchers);
```

Then add it to your jest setup file under `setupFilesAfterEnv`:

```ts
setupFilesAfterEnv: ['./setupJest.js'];
```

# Usage

## Helper functions

All matchers come with a helper function (e.g. `dynamoDbItem()`). It is recommended to use them for the following reasons:

- Validation

Jest technically allows any value in the `expect()` function, but all values can't be used with all matchers (e.g. you can't do `expect(123).toExist()`). sls-jest uses those helper fucntions to keep track of **what** you are intending to test and makes sure that they can be used with the matcher you are using.

- TypeScript support

If you use TypeScript, you will get intellisense support for the correct input of the matchers.

- Readability

Code becomes much easier to read and more language-natural.

e.g. `expect(dynamodbItem(...)).toExist();`

## General matchers

- [DynamoDB](doc/matchers/dynamodb.md)
- [AppSync](doc/matchers/appsync.md)

## Spies

### Setup

When using spies, sls-jest creates temporary files to deploy and keep track of underlying infrastrucutre. Those files are not meant to be commited to your reposityry. Consider adding `.sls-jest` to your `.gitignore` file.

In order to keep track of the different stacks across different users/branches/environments, etc, you need to specify an environment variable named `SLS_JEST_TAG` before using any spy.

```bash
export SLS_JEST_TAG my-branch
```

### Cleaning up

When you are done with your tests, you can cleanup any remaining spy stack using the following command:

```bash
npx sls-jest destroy -t my-branch
```

### Reference

- [EventBridge](doc/spies/eventbridge.md)
