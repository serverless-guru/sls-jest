import { EventBridgeEvent } from 'aws-lambda';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { EventBridgeSpy } from '../spies/eventBridge';
import { MatcherState } from 'expect';
import { equals, subsetEquality, iterableEquality } from '@jest/expect-utils';

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

export const toHaveEventMatchingObject = async function (
  this: MatcherState,
  spy: EventBridgeSpy,
  expected: Partial<EventBridgeEvent<string, unknown>>,
): Promise<AssertionResponse> {
  const events = await spy.awaitEvents((events) => {
    return events.some((event) =>
      equals(event, expected, [iterableEquality, subsetEquality]),
    );
  });

  const pass = events.some((event) =>
    equals(event, expected, [iterableEquality, subsetEquality]),
  );

  const message = pass
    ? () => {
        return (
          matcherHint('toHaveEventMatchingObject', 'eventsSpy', 'expected') +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          `Number of events: ${printReceived(events.length)}`
        );
      }
    : () => {
        return (
          matcherHint('toHaveEventMatchingObject', 'eventsSpy', 'expected') +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          (events.length > 0
            ? `Received: ${printReceived(events[0])}`
            : `Number of events: ${printReceived(events.length)}`)
        );
      };

  return { message, pass };
};

export const toHaveEventMatchingObjectTimes = async function (
  this: MatcherState,
  spy: EventBridgeSpy,
  expected: Partial<EventBridgeEvent<string, unknown>>,
  expectedTimes: number,
): Promise<AssertionResponse> {
  const events = await spy.awaitEvents((events) => {
    const found = events.filter((event) =>
      equals(event, expected, [iterableEquality, subsetEquality]),
    );
    return found.length > expectedTimes;
  });

  const found = events.filter((event) =>
    equals(event, expected, [iterableEquality, subsetEquality]),
  );
  const count = found.length;
  const pass = count === expectedTimes;

  const message = pass
    ? () =>
        matcherHint(
          'toHaveEventMatchingObjectTimes',
          'eventsSpy',
          'expected, times',
        ) +
        `\n\n` +
        `Expected number of events: not ${printExpected(expectedTimes)}`
    : () =>
        matcherHint(
          'toHaveEventMatchingObjectTimes',
          'eventsSpy',
          'expected, times',
        ) +
        '\n\n' +
        `Expected number of events: ${printExpected(expectedTimes)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};
