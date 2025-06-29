import { ApplicationState, SportEvent } from '../types';
import { LoggerUtil } from '../utils/logger.util';

export class StateManagerService {
  private state: ApplicationState = {};
  private previousState: ApplicationState = {};

  updateState(newEvents: SportEvent[]): void {
    this.previousState = { ...this.state };
    const currentEventIds = new Set<string>();

    // proces new-updated events
    for (const event of newEvents) {
      currentEventIds.add(event.id);
      const previousEvent = this.previousState[event.id];

      // just logging
      if (previousEvent) {
        this.checkForChanges(previousEvent, event);
      }

      this.state[event.id] = event;
    }

    // mark removed events
    for (const [eventId, event] of Object.entries(this.previousState)) {
      if (!currentEventIds.has(eventId) && event.status !== 'REMOVED') {
        const removedEvent = { ...event, status: 'REMOVED' };
        this.state[eventId] = removedEvent;

        LoggerUtil.logStatusChange(
          eventId,
          this.getEventDisplayName(event),
          event.status,
          'REMOVED'
        );
      }
    }
  }

  getClientState(): ApplicationState {
    const clientState: ApplicationState = {};

    // filter out REMOVED
    for (const [eventId, event] of Object.entries(this.state)) {
      if (event.status !== 'REMOVED') {
        clientState[eventId] = event;
      }
    }

    return clientState;
  }

  private checkForChanges(oldEvent: SportEvent, newEvent: SportEvent): void {
    const eventName = this.getEventDisplayName(newEvent);

    // log status change
    if (oldEvent.status !== newEvent.status) {
      LoggerUtil.logStatusChange(
        newEvent.id,
        eventName,
        oldEvent.status,
        newEvent.status
      );
    }

    // log score changes
    if (JSON.stringify(oldEvent.scores) !== JSON.stringify(newEvent.scores)) {
      LoggerUtil.logScoreChange(
        newEvent.id,
        eventName,
        oldEvent.scores,
        newEvent.scores
      );
    }
  }

  private getEventDisplayName(event: SportEvent): string {
    return `${event.competitors.HOME.name} vs ${event.competitors.AWAY.name}`;
  }
}
