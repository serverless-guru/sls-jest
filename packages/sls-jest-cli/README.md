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
### Deploy
```bash
# deploy resources needed for testing "default" event bridge buses.

sls-jest deploy -e default

# deploy resources needed for testing "default" AND "custom-bus-1" event bridge buses.

sls-jest deploy -e default custom-bus-1
```

### Destroy
```bash
# Destroy resources created by the above command
sls-jest destroy -e default custom-bus-1
```