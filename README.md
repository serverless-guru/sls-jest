# Setup Jest

To start using sls-jest matchers you need to add `"./node_modules/sls-jest/lib/setup.js"` path to the `setupFilesAfterEnv` jest config option like so:

```ts
setupFilesAfterEnv: ['./setupJest.js'];
```

```ts
// setupJest.ts
import { matchers } from 'sls-jest';

if (expect !== undefined) {
  expect.extend(matchers);
} else {
  console.error(
    "Unable to find Jest's global expect." +
      '\nPlease check you have added jest-extended correctly to your jest configuration.' +
      '\nSee https://github.com/jest-community/jest-extended#setup for help.',
  );
}
```

# Publish the package locally

```ts
npm run link .
```

Now you can run npm `link sls-jest` in the projects where you want to install and use this package 🥳️

**Note**: the project should be built before running the above command, you can build the project by running `npm run build` from the project root or from `/packages/sls-jest-cli`.
