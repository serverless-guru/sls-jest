import AsyncRetry from 'async-retry';
import { reduce } from 'lodash';
import { z, ZodType, ZodTypeAny, ZodTypeDef } from 'zod';

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

export const validateInput = <
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

        if (!Array.isArray(value)) {
          return [...acc, ...value?._errors.map((e) => `\t${key}: ${e}`)];
        } else {
          return [...acc, ...value?.map((e) => `\t${key}: ${e}`)];
        }
      },
      [] as string[],
    );

    throw new Error(`Invalie ${helperName}() input:\n${errors.join('\n')}`);
  }
};
