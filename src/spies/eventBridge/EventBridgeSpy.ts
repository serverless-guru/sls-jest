import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy } from 'lodash';
import { BehaviorSubject, filter, take, takeUntil, timer } from 'rxjs';
import { destroyStack } from '../../infrastructure';
import { EventBridgeMatcherOptions } from '../../matchers';

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

export type EventBridgeSpyConfig = {
  stackName?: string;
  matcherDefaultTimeout?: number;
};

/**
 * A basic class for spying on EventBridge events.
 */
export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  subject: BehaviorSubject<EventBridgeEvent<string, unknown>[]>;
  matcherTimeout: number;

  constructor(private config: EventBridgeSpyConfig = {}) {
    this.subject = new BehaviorSubject(this.events);
    this.matcherTimeout = config.matcherDefaultTimeout ?? 10000;
  }

  async startPolling() {
    throw new Error('Not implemented. Implement this in a child class.');
  }

  protected appendEvents(events: EventBridgeEvent<string, unknown>[]) {
    this.events = uniqBy([...this.events, ...events], 'id');
    this.subject.next(this.events);
  }

  awaitEvents(
    matcher: EventMatcher,
    config?: EventBridgeMatcherOptions,
  ): Promise<EventBridgeEvent<string, unknown>[]> {
    return new Promise<EventBridgeEvent<string, unknown>[]>((resolve) => {
      this.subject
        .pipe(takeUntil(timer(config?.timeout ?? this.matcherTimeout)))
        .pipe(filter((events) => matcher(events) === true))
        .pipe(take(1))
        .subscribe({
          next: (events) => {
            resolve(events);
          },
          complete: () => {
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

  protected async stopPolling() {
    throw new Error('Not implemented. Implement this in a child class.');
  }

  /**
   * Destroy the stack where test resources are deployed.
   */
  async destroyStack() {
    if (!this.config.stackName) {
      throw new Error('Stack name not provided');
    }
    await destroyStack({
      stackName: this.config.stackName,
    });
  }
}
