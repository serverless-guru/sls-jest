/**
 * General helpers
 * @internal
 */

import AsyncRetry from 'async-retry';

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
