# Spies Setup

When using spies, `sls-jest` sometimes needs to create temporary files to deploy and keep track of some underlying infrastructure they require to function. Those files are not meant to be committed to your repository. Consider adding `.sls-jest` to your `.gitignore` file.

In order to keep track of the different stacks across different users/branches/environments, etc. you also need to specify an environment variable named `SLS_JEST_TAG` before running `jest`.

```bash
export SLS_JEST_TAG my-branch
```

## Cleaning up

When you are done with your tests, you can clean up any remaining architecture and artifacts using the following command:

```bash
npx sls-jest destroy -t my-branch
```
