import AsyncRetry from 'async-retry';
import { z } from 'zod';

/**
 * General helpers
 * @internal
 */

export type HelperZodSchema<T extends (...args: any) => any> = z.ZodType<
  Parameters<T>[0]
>;

export type ItemTypes = 'dynamodbItem' | 'vtlMappingTemplate';

export interface IMatcherHelperInput<Name extends ItemTypes = ItemTypes> {
  _helperName: Name;
}

export type MatcherHelperInput<Name extends ItemTypes, T> = T &
  IMatcherHelperInput<Name>;

export type MatcherHelper<Name extends ItemTypes, T> = (
  input: T,
) => MatcherHelperInput<Name, T>;

export type RetryableMatcherHelper<Name extends ItemTypes, T> = (
  input: T & Retryable,
) => MatcherHelperInput<Name, T & Retryable>;

type Retryable = {
  retryPolicy?: AsyncRetry.Options;
};

/**
 * Validate typeof helpers
 */

export const assertMatcherHelperInput = <T extends ItemTypes[]>(
  input: any,
  matcherName: string,
  compatibleItems: T,
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

export const validateInput = (
  helperName: string,
  schema: z.ZodTypeAny,
  input: any,
) => {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  throw new Error(
    `${helperName}(): ${result.error.errors.map((e) => e.message).join(', ')}`,
  );
};
