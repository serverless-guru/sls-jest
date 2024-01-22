import { LambdaInvocationError, invokeLambdaFunction } from '../../lib';

const sum = 'sum';
// export const handler = async (event) => {
//   if (!event.a) {
//     throw new Error('event.a is required');
//   }
//   if (typeof event.a !== 'number') {
//     throw new Error('event.a must be a number');
//   }
//   if (!event.b) {
//     throw new Error('event.b is required');
//   }
//   if (typeof event.b !== 'number') {
//     throw new Error('event.b must be a number');
//   }
//   return event.a + event.b;
// };

const sumJson = 'sum-json'; // returns JSON
// export const handler = async (event) => {
//   if (!event.a) {
//     throw new Error('event.a is required');
//   }
//   if (typeof event.a !== 'number') {
//     throw new Error('event.a must be a number');
//   }
//   if (!event.b) {
//     throw new Error('event.b is required');
//   }
//   if (typeof event.b !== 'number') {
//     throw new Error('event.b must be a number');
//   }
//   return { "result": event.a + event.b }; <-- JSON
// };

describe('invokeLambdaFunction', () => {
  it('should invoke a lambda function', async () => {
    const result = await invokeLambdaFunction({
      functionName: sum,
      payload: {
        a: 1,
        b: 2,
      },
    });

    expect(result).toBe(3);
  });

  it('should invoke a lambda function that returns JSON', async () => {
    const result = await invokeLambdaFunction({
      functionName: sumJson,
      payload: {
        a: 1,
        b: 2,
      },
    });

    expect(result).toEqual({ result: 3 });
  });

  it('should throw an error if the lambda function fails', async () => {
    await expect(
      invokeLambdaFunction({
        functionName: sum,
        payload: {
          a: 1,
        },
      }),
    ).rejects.toMatchInlineSnapshot(
      `[LambdaInvocationError: event.b is required]`,
    );

    // alternatively, we can use try/catch
    try {
      await invokeLambdaFunction({
        functionName: sum,
        payload: {
          a: 1,
        },
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[LambdaInvocationError: event.b is required]`,
      );
      if (error instanceof LambdaInvocationError) {
        expect(error.payload).toMatchInlineSnapshot(`
          Object {
            "errorMessage": "event.b is required",
            "errorType": "Error",
            "trace": Array [
              "Error: event.b is required",
              "    at Runtime.handler (file:///var/task/index.mjs:9:11)",
              "    at Runtime.handleOnceNonStreaming (file:///var/runtime/index.mjs:1173:29)",
            ],
          }
        `);
      }
    }
  });

  it('should throw an error when the lambda function does not exist', async () => {
    await expect(
      invokeLambdaFunction({
        functionName: 'non-existent-function',
        payload: {
          a: 1,
          b: 2,
        },
      }),
    ).rejects.toMatchInlineSnapshot(
      `[ResourceNotFoundException: Function not found: arn:aws:lambda:us-east-1:xxxxxxxxxxxx:function:non-existent-function]`,
    );
  });
});
