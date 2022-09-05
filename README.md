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

Add `.sls-jest` to `.gitignore`:

In some casses, sls-jest uses temporary files to deploy and keep track of underlying infrastrucutre (e.g.: for spies). Those files are not meant to be commited to your reposityry.
