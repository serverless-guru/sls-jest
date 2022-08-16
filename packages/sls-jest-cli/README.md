# Setup Jest
To start using sls-jest matchers you need to add `"./node_modules/sls-jest/lib/setup.js"` path to the `setupFilesAfterEnv` jest config option like so: 

```ts
setupFilesAfterEnv: ["./node_modules/sls-jest/lib/setup.js"]
```
# Publish the command locally
```ts
npm link --local
```
Now you can use the command `sls-jest` from everywhere 🥳️

**Note**: the project should be built before running the above command, you can build the project by running `npm run build` from the project root or from `/packages/sls-jest-cli`.

# Usage
### Help
```bash
sls-jest --help
```
### Destroy
```bash
# Destroy resources created with tag "my-tag"
sls-jest destroy --tag my-tag
```