# AppSync

A collection of matchers to test mapping templates.

Use the `appSyncMappingTemplate` helper function with mapping template matchers.

- `template`: A string representing the mapping template
- `context`: The [context object](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-context-reference.html#accessing-the-context) to be injected into the template

## Matchers

### `toEvaluateTo(value)`

Asserts that a mapping template evaluates to a given string or object for a given context.

If you pass an object as `value`, the matcher will try to parse the generated template into a javascript object before comparing the values.

```typescript
// matching as a string
await expect(
  appSyncMappingTemplate({
    template: fs.readFileSync('tempalte.vtl', { encoding: 'utf8' }),
    context: {
      arguments: {
        id: '123',
      },
    },
  }),
).toEvaluateTo(`
{
  "id": "123"
}
`);
```

```typescript
// matching as an object also works as long as the mapping template evaluates to a valid JSON
// otherwise, an error will be thrown
await expect(
  appSyncMappingTemplate({
    template: fs.readFileSync('tempalte.vtl', { encoding: 'utf8' }),
    context: {
      arguments: {
        id: '123',
      },
    },
  }),
).toEvaluateTo({
  id: '123',
});
```

### `toEvaluateToSnapshot()`

Asserts that the evaluated template matches the most recent snapshot. It works similarely to jest's [toMatchSnapshot](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint).

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

### `toEvaluateToInlineSnapshot()`

Asserts that the evaluated template matches the most recent snapshot. It works similarely to jest's [toMatchInlineSnapshot](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot).

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
    "id": "789",
  }
`);
```
