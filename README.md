# Setup Jest
To start using sls-jest matchers you need to add `"./node_modules/sls-jest/lib/setup.js"` path to the `setupFilesAfterEnv` jest config option like so: 

```ts
setupFilesAfterEnv: ["./node_modules/sls-jest/lib/setup.js"]
```
