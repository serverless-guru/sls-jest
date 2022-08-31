import AsyncRetry from 'async-retry';
import { MatcherState } from 'expect';
import { defaultsDeep } from 'lodash';

type MatcherFunctionResult = {
  pass: boolean;
  message: () => string;
};

type MatcherFunction = (...args: any[]) => Promise<MatcherFunctionResult>;

class InvalidResultError extends Error {}

export const withRetry = function <Fn extends MatcherFunction>(
  matcher: Fn,
  defaultRetryOptions?: AsyncRetry.Options,
) {
  return async function (this: MatcherState, ...args: any[]) {
    const retryOptions = defaultsDeep(
      args[0]?.retryPolicy,
      defaultRetryOptions,
      {
        retries: 2, // 2 retries 3 attempts total)
        minTimeout: 500,
      },
    );

    let result: MatcherFunctionResult | undefined;

    const retryer: AsyncRetry.RetryFunction<
      MatcherFunctionResult | undefined
    > = async (bail) => {
      try {
        result = await matcher.call(this, ...args);

        if (result.pass !== !this.isNot) {
          throw new InvalidResultError();
        }

        return result;
      } catch (error) {
        if (
          // catch any error thrown other than InvalidResultError
          // e.g. invalid AWS credentials
          // and bail immediately
          error instanceof Error &&
          !(error instanceof InvalidResultError)
        ) {
          bail(error);
        } else {
          throw error;
        }
      }
    };

    try {
      return await AsyncRetry(retryer, retryOptions);
    } catch (error) {
      if (result && error instanceof InvalidResultError) {
        // last attempt, return the last known result
        return result;
      }

      throw error;
    }
  };
};
