import { EventBridgeEvent } from 'aws-lambda';
import { uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';

type EventMatcher = (
  event: EventBridgeEvent<string, unknown>[],
) => boolean | null;

/**
 * A basic class for spying on EventBridge events.
 */
export class EventBridgeSpy {
  events: EventBridgeEvent<string, unknown>[] = [];
  subject: BehaviorSubject<EventBridgeEvent<string, unknown>[]>;

  constructor() {
    this.subject = new BehaviorSubject(this.events);
  }

  async pollEvents() {
    throw new Error('Not implemented. Implement this in a child class.');
  }

  appendEvents(events: EventBridgeEvent<string, unknown>[]) {
    const uniqueEvents = uniqBy(events, 'id');
    this.events = uniqBy([...this.events, ...uniqueEvents], 'id');
    this.subject.next(this.events);
  }

  awaitEvents(
    matcher: EventMatcher,
  ): Promise<EventBridgeEvent<string, unknown>[]> {
    return new Promise<EventBridgeEvent<string, unknown>[]>((resolve) => {
      const sub = this.subject.subscribe({
        next: (events) => {
          if (matcher(events)) {
            sub.unsubscribe();
            resolve(events);
          }
        },
        complete: () => {
          resolve(this.events);
        },
      });
    });
  }

  finishedPolling() {
    this.subject.complete();
  }

  async mockReset() {
    await this.stopPolling();
    this.clearMock();
  }

  async stopPolling() {}

  clearMock() {
    this.events = [];
  }
}
