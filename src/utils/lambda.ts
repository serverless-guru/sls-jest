import { InvokeCommand, LambdaClientConfig } from '@aws-sdk/client-lambda';
import { getLambdaClient } from './internal';

type LambdaErrorPayload = {
  errorMessage: string;
  errorType: string;
  trace: string[];
};

/**
 * Lambda invocation error, contains the error payload.
 */
export class LambdaInvocationError extends Error {
  payload: LambdaErrorPayload;
  constructor(message: string, payload: LambdaErrorPayload) {
    super(message);
    this.name = 'LambdaInvocationError';
    this.payload = payload;
  }
}

/**
 * Invoke Lambda Function input
 */
export type InvokeLambdaFunctionInput = {
  /**
   * The function name.
   */
  functionName: string;
  /**
   * The function payload.
   */
  payload: object;
  /**
   * An optional Lambda SDK client configuration.
   */
  clientConfig?: LambdaClientConfig;
};

/**
 * Invoke a Lambda function.
 *
 * @param input {@link InvokeLambdaFunctionInput}
 * @throws {@link LambdaInvocationError}
 */
export const invokeLambdaFunction = async (
  input: InvokeLambdaFunctionInput,
): Promise<string | object> => {
  const client = getLambdaClient(input.clientConfig);

  const lambdaResponse = await client.send(
    new InvokeCommand({
      FunctionName: input.functionName,
      Payload: JSON.stringify(input.payload),
    }),
  );

  const payload = new TextDecoder('ascii').decode(lambdaResponse.Payload);

  if (lambdaResponse.FunctionError) {
    const error = JSON.parse(payload) as LambdaErrorPayload;
    throw new LambdaInvocationError(error.errorMessage, error);
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    // do nothing
  }

  return payload;
};
