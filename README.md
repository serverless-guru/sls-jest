## sls-jest

[![Continuous Integration](https://github.com/serverless-guru/sls-jest/actions/workflows/ci.yml/badge.svg)](https://github.com/serverless-guru/sls-jest/actions/workflows/ci.yml) [![Release](https://github.com/serverless-guru/sls-jest/actions/workflows/release.yml/badge.svg)](https://github.com/serverless-guru/sls-jest/actions/workflows/release.yml)

<div style="text-align: center">
  <img src="sls-jest.png" width="250" alt="sls-jest logo">
  
  A jest extension to test serverless applications.
</div>

---

Testing serverless applications is hard. Ideally, you want to test against the real infrastrucutre and avoid mocks. e.g. a real DynamoDB table, real Lambda functions. However, the asynchronous nature of serverless makes it difficult to write tests that work and are deterministic.

This library offers a suite of tools that help solve, or at least mitigate, those issues. It is built on top of the famous [jest](https://jestjs.io/docs/getting-started) library and adds new serverless-related matchers.

# Getting started

## Install sls-jest

```bash
npm i sls-jest
```

## Setup Jest

Create a setup file:

```typescript
// setupJest.ts
import { matchers } from 'sls-jest';

expect.extend(matchers);
```

Then use it in your [jest config file](https://jestjs.io/docs/configuration) (`jest.config.ts`) under `setupFilesAfterEnv`:

```typescript
export default {
  // ..
  setupFilesAfterEnv: ['./setupJest.ts'];
}
```

## Documentation

For full documentation and guides, read the [documentation website](https://serverlessguru.gitbook.io/sls-jest/).
