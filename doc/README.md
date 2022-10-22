# Getting started

## Installing sls-jest

```bash
npm i sls-jest
```

## Setup Jest

Create a setup file:

```ts
// setupJest.ts
import { matchers } from 'sls-jest';

expect.extend(matchers);
```

Then use it in your [jest config file](https://jestjs.io/docs/configuration) (`jest.config.ts`) under `setupFilesAfterEnv`:

```ts
setupFilesAfterEnv: ['./setupJest.ts'];
```
