---
description: >-
  How to use sls-jest with Github Actions
---

# Deploy feauture ephemeral stacks

You can use Github Actions to run your tests against an ephemeral stack each time you open a new Pul Request and push new code to it.

```yaml
name: Deploy and run tests

on:
  pull_request:
    branches:
      - main

# avoid running several deployments in parallel
concurrency: ${{ github.ref }}

# Grant GA the required permissions to assume the IAM role
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'

      - name: Install dependencies
        run: npm ci

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1-node16
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deployer # the role to assume
          role-duration-seconds: 3600

      # Deploy to a unique stack for each Pull Request
      - name: Deploy
        run: sls deploy --stage ci${{ github.event.pull_request.number }} # or cdk deploy --all or whatever

      # run tests
      - name: Integration tests
        env:
          # specify a unique SLS_JEST_TAG for this PR
          SLS_JEST_TAG: ci${{ github.event.pull_request.number }}
        run: npx jest --runInBand
```

# Teardown the ephemeral stack on merge

When you are happy with your PR, you can teardown your stack and cleanup `sls-jest` artifacts after you merge it.

```yaml
name: Teardown stack

on:
  pull_request:
    types: [closed]
    branches:
      - main

# Grant GA the required permissions to assume the IAM role
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'

      - name: Install dependencies
        run: npm ci

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1-node16
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deployer # the role to assume
          role-duration-seconds: 3600

      - name: Cleanup sls-jest artifacts
        run: npx sls-jest destroy --tag ci${{ github.event.pull_request.number }}

      - name: Destroy stack
        run: sls remove --stage ci${{ github.event.pull_request.number }} # or cdk destroy --all --force or whatever
```
