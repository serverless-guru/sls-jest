import AsyncRetry from 'async-retry';
import { reduce } from 'lodash';
import { z, ZodType } from 'zod';

/**
 * Helper input schema utility type
 */
export type HelperZodSchema<T extends (...args: any) => any> = z.ZodType<
  Parameters<T>[0]
>;

/**
 * Helper input type names
 */
export type ItemType = 'dynamodbItem' | 'appSyncMappingTemplate';

/**
 * Matcher helper input
 */
export interface IMatcherHelperInput<Name extends ItemType = ItemType> {
  _helperName: Name;
}

/**
 * Matcher input type
 */
export type MatcherHelperInput<Name extends ItemType, T> = T &
  IMatcherHelperInput<Name>;

/**
 * Helper function
 */
export type MatcherHelper<Name extends ItemType, T> = (
  input: T,
) => MatcherHelperInput<Name, T>;

/**
 * Retryable matcher function
 */
export type RetryableMatcherHelper<Name extends ItemType, T> = (
  input: T & Retryable,
) => MatcherHelperInput<Name, T & Retryable>;

/**
 * Retryable matcher input
 */
type Retryable = {
  retryPolicy?: AsyncRetry.Options;
};

/**
 * Matcher input validator
 */
export const assertMatcherHelperInputType = <T extends ItemType[]>(
  matcherName: string,
  compatibleItems: T,
  input: any,
): IMatcherHelperInput<T[number]> => {
  if (typeof input !== 'object' || !input._helperName) {
    throw new Error(
      `Invalid matcher helper input. Please use one of the provided helpers.`,
    );
  }

  if (!compatibleItems.includes(input._helperName)) {
    throw new Error(
      `${input._helperName}() is not compatible with the ${matcherName}() matcher`,
    );
  }

  return input;
};

/**
 * Validate helper inputs
 */
export const assertMatcherHelperInputValue = <
  T extends ZodType<any, any, Record<string, unknown>>,
>(
  helperName: string,
  schema: T,
  input: any,
) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = reduce(
      result.error.format(),
      (acc, value, key) => {
        if (!value) {
          return acc;
        }

        if (Array.isArray(value)) {
          return [...acc, ...value];
        } else {
          return [...acc, ...value?._errors.map((e) => `\t${key}: ${e}`)];
        }
      },
      [] as string[],
    );

    throw new Error(`Invalid ${helperName}() input:\n${errors.join('\n')}`);
  }
};
