# Core Concepts

## Helper functions

`sls-jest` comes with a set of helper functions which represent AWS resources (e.g. `dynamoDbItem()`, `s3Object()`). They are used in combination with matchers in order to perform assertions. They serve several purposes:

- **Validation**

Jest technically allows any value in the `expect()` function, but all values can't be used with all `matchers` (e.g. `expect(123).toExist()` does not make sense). `sls-jest` uses those helper functions in order to check whether a matcher can be used with the input value you are passing. If they are not compatible, an error will be thrown.

Basic validation is also done on the values that are passed in the helper functions. e.g. with `dynamodbItem()`, the `tableName` and `key` attributes are required.

- **Reuseability**

Some matchers can be used with several resources. e.g. You can do `expect(dynamodbItem(...)).toExist();` or `expect(s3Object(...)).toExist();`.

`sls-jest` uses those helpers to keep track of **what** you are intending to test and use the appropriate logic internally.

- **First-class TypeScript support**

You will get intellisense support for valid `expect` and matchers input values, and only matchers that are compatible with the specified helper will be allowed.

- **Readability**

Thanks to those helpers, code becomes much easier to read and more natural-language.

e.g. `expect(dynamodbItem(...)).toExist();`

## Spies

Spies work similarly to [Jest Function Spies](https://jestjs.io/docs/mock-function-api). They let you spy on a some serverless resources such as an [EventBridge](spies/eventbridge.md) bus.
