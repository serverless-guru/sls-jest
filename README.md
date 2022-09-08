# Installing sls-jest

```bash
npm i @sls-jest/core
```

# Setup Jest

Create a setup file:

```ts
// setupJest.ts
import { matchers } from 'sls-jest';

expect.extend(matchers);
```

Then add it to your jestsetup file under `setupFilesAfterEnv`:

```ts
setupFilesAfterEnv: ['./setupJest.js'];
```

# Usage

## Matchers

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
