# Lambda

## Functions

### `invokeLambdaFunction(input:{functionName: string; payload: object})`

Invoke a Lambda function.

Parameters:
- `functionName`: the Lambda function name
- `payload`: the payload/event to send to the Lambda function

Note: `invokeLambdaFunction` automatically parses the response from the Lambda function and returns either a `string` or an `object` (JSON object) depending on the returned value of the Lambda function: if the Lambda function returns a string, the result will be of type string; if it returns an object, the result will be of type object.

example:
```typescript
const result1 = await invokeLambdaFunction({
      functionName: 'sum',
      payload: {
        a: 1,
        b: 2,
      },
    });

console.log(result1) // 3

const result2 = await invokeLambdaFunction({
      functionName: 'sum-json',
      payload: {
        a: 1,
        b: 2,
      },
    });

console.log(result2) // { "result" : 3 }
```