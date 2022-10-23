# AWS credentials

Under the hood, `sls-jest` uses the AWS SDK for javascript. Thus, credentials are taken in order of preference as described on [this page](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).

## Locally on your machine

When running jest on your local machine, the simplest way is to use your shared credentials file. By default, the `default` profile is used. You can use another profile by passing it as the `AWS_PROFILE` env variable before you invoke `jest`.

```bash
AWS_PROFILE=playground npx jest
```

You can also use something like [direnv](https://github.com/direnv/direnv) to automatically set the right profile for your project.

Side note: We recommend [leapp](https://www.leapp.cloud/) to manage your local credentials.

## CI/CD

When running tests in a CI/CD environment, the recommended way is to use OIDC. The assumed role must have sufficient permissions to access all the resources your test suite uses (or [creates](spies/setup.md))

You should check the documentation of your CI/CD provider. Here are some guides for popular ones:

- [Github Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) (also see [this article](https://benoitboure.com/securely-access-your-aws-resources-from-github-actions))
- [GitLab](https://docs.gitlab.com/ee/ci/cloud_services/aws/)
- [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/deploy-on-aws-using-bitbucket-pipelines-openid-connect/)
- [CircleCi](https://circleci.com/docs/openid-connect-tokens/#aws)
