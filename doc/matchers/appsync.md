# AppSync

A collection of matchers to test AWS AppSync mapping templates and JS resolvers.

## Helper Functions

### `appSyncResolver(input: AppSyncResolverInput)`

Use the `appSyncResolver` helper function to test JS resolvers.

- `code`: The path to a file containing an `APPSYNC_JS` resolver code. The path can either be absolute, or relative to the working directory (`process.cwd()`).
- `function`: The function to test. Must be `request` or `response`.
- `context`: The [context object](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference-js.html) to be injected into the template

### `appSyncMappingTemplate(input: AppSyncMappingTemplateInput)`

Use the `appSyncMappingTemplate` helper function to test VTL mapping templates.

- `template`: The path to a file containing containing a mapping template. The path can either be absolute, or relative to the working directory (`process.cwd()`).
- `context`: The [context object](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html#accessing-the-context) to be injected into the template

## Matchers

### `toEvaluateTo<E>(expected: E)`

Asserts that a mapping template or resolver evaluates to a given JSON object for a given context.

```typescript
// matching as a string
await expect(
  appSyncResolver({
    code: __dirname + '/resolver.js',
    function: 'request',
    context: {
      arguments: {
        id: '123',
      },
    },
  }),
).toEvaluateTo<DynamoDBGetItemRequest>({
  operation: 'GetItem',
  key: {
    pk: { S: '123' },
  },
});
```

### `toEvaluateToSnapshot(propertiesOrHint?: string, hint?: string)`

Asserts that the evaluated template matches the most recent snapshot. It works similarly to jest's [toMatchSnapshot](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint).

```typescript
await expect(
  appSyncMappingTemplate({
    template: fs.readFileSync('tempalte.vtl', { encoding: 'utf8' }),
    context: {
      arguments: {
        id: '123',
      },
    },
  }),
).toEvaluateToSnapshot();
```

### `toEvaluateToInlineSnapshot(propertiesOrHint?: string, hint?: string)`

Asserts that the evaluated template matches the most recent snapshot. It works similarly to jest's [toMatchInlineSnapshot](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot).

```typescript
await expect(
  appSyncMappingTemplate({
    template: fs.readFileSync('tempalte.vtl', { encoding: 'utf8' }),
    context: {
      arguments: {
        id: '789',
      },
    },
  }),
).toEvaluateToInlineSnapshot(`
  Object {
    "key": Object {
      "pk": Object {
        "S": "789",
      },
    },
    "operation": "GetItem",
    "version": "2017-02-28",
  }
`);
```
