# AppSync Mapping templates

A collection of matchers to test mapping templates.

Use the `vtlMappingTemplate` helper function with mapping template matchers.

- `template`: A string representing the VTL template
- `context`: The context to be injected into the template

## Matchers

### `toEvaluateTo(value)`

Asserts that a template evaluates to a given string or object. If you pass an object for `value`, the matcher will try to parse the generated template into a javascript object before comparing the values.

```ts
// matching as a string
await expect(
  vtlMappingTemplate({
    template: `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`,
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

```ts
// matching as an object
await expect(
  vtlMappingTemplate({
    template: `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`,
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

```ts
await expect(
  vtlMappingTemplate({
    template: `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`,
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

```ts
await expect(
  vtlMappingTemplate({
    template: `
#set($id=$ctx.args.id)
{
  "id": "$id"
}
`,
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
