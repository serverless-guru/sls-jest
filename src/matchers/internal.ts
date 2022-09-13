/**
 * Matcher output type
 */
export type MatcherFunctionResult = {
  pass: boolean;
  message: () => string;
};

/**
 * Matcher function
 */
export type MatcherFunction = (
  ...args: any[]
) => Promise<MatcherFunctionResult>;
