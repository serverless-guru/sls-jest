import { EventBridgeEvent } from 'aws-lambda';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { isMatch } from 'lodash';
import { EventBridgeSpy } from '../spies/eventBridge';

type AssertionResponse = {
  message: () => string;
  pass: boolean;
};

export const toHaveEventWithDetailType = async (
  spy: EventBridgeSpy,
  expected: string,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((events) => {
    return events.some((event) => event['detail-type'] === expected);
  });

  const pass = events.some((event) => event['detail-type'] === expected);

  const message = pass
    ? () => {
        return (
          matcherHint('toHaveEventWithDetailType', 'eventsSpy', 'detail-type') +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          `Number of events: ${printReceived(events.length)}`
        );
      }
    : () => {
        return (
          matcherHint('toHaveEventWithDetailType', 'eventsSpy', 'detail-type') +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          (events.length > 0
            ? `Received: ${printReceived(events[0]?.['detail-type'])}`
            : `Number of events: ${printReceived(events.length)}`)
        );
      };

  return { message, pass };
};

export const toHaveEventMatching = async (
  spy: EventBridgeSpy,
  expected: Partial<EventBridgeEvent<string, unknown>>,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((events) => {
    return events.some((event) => isMatch(event, expected));
  });

  const pass = events.some((event) => isMatch(event, expected));

  const message = pass
    ? () => {
        return (
          matcherHint('toHaveEventMatching', 'eventsSpy', 'expected') +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          `Number of events: ${printReceived(events.length)}`
        );
      }
    : () => {
        return (
          matcherHint('toHaveEventMatching', 'eventsSpy', 'expected') +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          (events.length > 0
            ? `Received: ${printReceived(events[0])}`
            : `Number of events: ${printReceived(events.length)}`)
        );
      };

  return { message, pass };
};

export const toHaveEventWithDetailTypeTimes = async (
  spy: EventBridgeSpy,
  expected: string,
  expectedTimes: number,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((events) => {
    const found = events.filter((event) => event['detail-type'] === expected);
    return found.length > expectedTimes;
  });

  const found = events.filter((event) => event['detail-type'] === expected);
  const count = found.length;
  const pass = count === expectedTimes;

  const message = pass
    ? () =>
        matcherHint(
          'toHaveEventWithDetailTypeTimes',
          'eventsSpy',
          'expected, times',
        ) +
        `\n\n` +
        `Expected number of events: not ${printExpected(expectedTimes)}`
    : () =>
        matcherHint(
          'toHaveEventWithDetailTypeTimes',
          'eventsSpy',
          'expected, times',
        ) +
        '\n\n' +
        `Expected number of events: ${printExpected(expectedTimes)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};

export const toHaveEventMatchingTimes = async (
  spy: EventBridgeSpy,
  expected: Partial<EventBridgeEvent<string, unknown>>,
  expectedTimes: number,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((events) => {
    const found = events.filter((event) => isMatch(event, expected));
    return found.length > expectedTimes;
  });

  const found = events.filter((event) => isMatch(event, expected));
  const count = found.length;
  const pass = count === expectedTimes;

  const message = pass
    ? () =>
        matcherHint(
          'toHaveEventMatchingTimes',
          'eventsSpy',
          'expected, times',
        ) +
        `\n\n` +
        `Expected number of events: not ${printExpected(expectedTimes)}`
    : () =>
        matcherHint(
          'toHaveEventMatchingTimes',
          'eventsSpy',
          'expected, times',
        ) +
        '\n\n' +
        `Expected number of events: ${printExpected(expectedTimes)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};

export const toHaveEvent = async (
  spy: EventBridgeSpy,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((e) => {
    return e.length > 0;
  });

  const count = events.length;
  const pass = count > 0;
  const message = pass
    ? () =>
        matcherHint('toHaveReceivedEvents', 'eventsSpy', '') +
        `\n\n` +
        `Expected number of events: ${printExpected(0)}\n` +
        `Received number of events: ${printReceived(count)}`
    : () =>
        matcherHint('toHaveReceivedEvents', 'eventsSpy', '') +
        '\n\n' +
        `Expected number of events >: ${printExpected(1)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};

export const toHaveEventTimes = async (
  spy: EventBridgeSpy,
  expected: number,
): Promise<AssertionResponse> => {
  const events = await spy.awaitEvents((e) => {
    return e.length > expected;
  });

  const count = events.length;
  const pass = count === expected;
  const message = pass
    ? () =>
        matcherHint('toHaveEventTimes', 'eventsSpy', 'times') +
        `\n\n` +
        `Expected number of events: not ${printExpected(expected)}`
    : () =>
        matcherHint('toHaveEventTimes', 'eventsSpy', 'times') +
        '\n\n' +
        `Expected number of events: ${printExpected(expected)}\n` +
        `Received number of events: ${printReceived(count)}`;

  return { message, pass };
};
