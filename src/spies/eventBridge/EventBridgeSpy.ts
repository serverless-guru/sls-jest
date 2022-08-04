import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { EventBridgeMatcherOptions } from '../../matchers';

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

export type EventBridgeSpyConfig = {
  matcherDefaultTimeout?: number;
};

/**
 * A basic class for spying on EventBridge events.
 */
export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  subject: BehaviorSubject<EventBridgeEvent<string, unknown>[]>;
  matcherTimeout: number;

  constructor(config: EventBridgeSpyConfig = {}) {
    this.subject = new BehaviorSubject(this.events);
    this.matcherTimeout = config.matcherDefaultTimeout ?? 10000;
  }

  async pollEvents() {
    throw new Error('Not implemented. Implement this in a child class.');
  }

  appendEvents(events: EventBridgeEvent<string, unknown>[]) {
    const uniqueEvents = uniqBy(events, 'id');
    this.events = uniqBy([...this.events, ...uniqueEvents], 'id');
    this.subject.next(events);
  }

  awaitEvents(
    matcher: EventMatcher,
    config?: EventBridgeMatcherOptions,
  ): Promise<EventBridgeEvent<string, unknown>[]> {
    return new Promise<EventBridgeEvent<string, unknown>[]>((resolve) => {
      const timer = setTimeout(() => {
        sub.unsubscribe();
        resolve(this.events);
      }, config?.timeout ?? this.matcherTimeout);
      const sub = this.subject.subscribe({
        next: (events) => {
          if (matcher(events)) {
            sub.unsubscribe();
            resolve(events);
          }
        },
        complete: () => {
          clearTimeout(timer);
          resolve(this.events);
        },
      });
    });
  }

  reset() {
    this.events = [];
    this.subject.complete();
    this.subject = new BehaviorSubject(this.events);
  }

  async stop() {
    await this.stopPolling();
    this.reset();
  }

  async stopPolling() {}
}
