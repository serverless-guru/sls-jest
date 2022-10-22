#sls-jest

Testing serverless applications is hard. Ideally, you want to test against the real infrastrucutre and avoid mocks. e.g. a real DynamoDB table, real Lambda functions. However, the asynchronous nature of serverless makes it difficult to write tests that work and are deterministic.

This library offers a suite of tools that help solve, or at least mitigate, those issues. It is built on top of the famous [jest](https://jestjs.io/docs/getting-started) library and adds new serverless-related matchers.

[Read the documentation](https://serverlessguru.gitbook.io/sls-jest/)
