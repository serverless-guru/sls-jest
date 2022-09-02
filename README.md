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
