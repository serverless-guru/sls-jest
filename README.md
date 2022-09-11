Testing serverless applications is hard. Ideally, you want to test against the real infrastrucutre and avoid mocks. e.g. a real DynamoDB table, real Lambda functions. However, the asynchronous nature of serverless makes it difficult to write tests that work and are deterministic.

This library offers a suite of tools that help solve, or at least mitigate, those issues. It is built on top of the famous [jest](https://jestjs.io/docs/getting-started) library and adds useful serverless-related matchers.

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

Then use it to your [jest config file](https://jestjs.io/docs/configuration) (`jest.config.js`) under `setupFilesAfterEnv`:

```ts
setupFilesAfterEnv: ['./setupJest.js'];
```

# Usage

## Helper functions

sls-jests comes with a set of helper functions (e.g. `dynamoDbItem()`, `vtlMappingTemplate()`). Your are required to use them in combination with the matchers that are provided. They serve several purposes:

- Validation

Jest technically allows any value in the `expect()` function, but all values can't be used with all matchers (e.g. `expect(123).toExist()` does not make sense). sls-jest uses those helper fucntions in order to check whether a matcher can be used with the input value you are passing. If they are not compatible, an error will be thrown. A basic validation is also done on the values that are passed in the helper funcitons. e.g. with `dynamodbItem()`, the `tableName` and `key` attributes are required.

- Reuseability

Some matchers can be used with several inputs. e.g. You can do `expect(dynamodbItem(...)).toExist();` or `expect(s3Object(...)).toExist();` (note: S3 is not yet implemented).

sls-jest uses those helpers to keep track of **what** you are intending to test and use the appropriate logic internally.

- TypeScript support

If you use TypeScript, you will get intellisense support for the correct input of the matchers.

- Readability

Thanks to those helpers, code becomes much easier to read and more language-natural.

e.g. `expect(dynamodbItem(...)).toExist();`

## General matchers

- [DynamoDB](doc/matchers/dynamodb.md)
- [AppSync](doc/matchers/appsync.md)

## Spies

### Setup

When using spies, sls-jest creates temporary files to deploy and keep track of some underlying infrastrucutre they require to function. Those files are not meant to be commited to your reposityry. Consider adding `.sls-jest` to your `.gitignore` file.

In order to keep track of the different stacks across different users/branches/environments, etc., you also need to specify an environment variable named `SLS_JEST_TAG` before running `jest.

```bash
export SLS_JEST_TAG my-branch
```

### Cleaning up

When you are done with your tests, you can cleanup any remaining architecture and artifacts using the following command:

```bash
npx sls-jest destroy -t my-branch
```

### Spies Reference

- [EventBridge](doc/spies/eventbridge.md)
