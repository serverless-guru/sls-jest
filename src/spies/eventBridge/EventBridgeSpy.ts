import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy } from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';
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
  subscription: Subscription;
  matcherTimeout: number;

  constructor(private config: EventBridgeSpyConfig = {}) {
    this.subject = new BehaviorSubject(this.events);
    this.matcherTimeout = config.matcherDefaultTimeout ?? 10000;
    this.subscription = new Subscription();
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
      const timer = setTimeout(() => {
        if (!this.subscription.closed) {
          this.subscription.unsubscribe();
        }
        resolve(this.events);
      }, config?.timeout ?? this.matcherTimeout);
      if (!this.subscription.closed) {
        this.subscription.unsubscribe();
      }
      this.subscription = this.subject.subscribe({
        next: (events) => {
          if (matcher(events)) {
            if (!this.subscription.closed) {
              this.subscription.unsubscribe();
            }
            clearTimeout(timer);
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
