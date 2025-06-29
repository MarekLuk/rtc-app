import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManagerService } from '../../src/services/state-manager.service';
import type { SportEvent} from '../../src/types';
import { LoggerUtil } from '../../src/utils/logger.util';

const consoleSpy = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

vi.mock('../../src/utils/logger.util', () => ({
  LoggerUtil: {
    logScoreChange: vi.fn(),
    logStatusChange: vi.fn(),
    logMappingError: vi.fn(),
  },
}));

describe('StateManagerService', () => {
  let stateManager: StateManagerService;
  const mockEvent: SportEvent = {
    id: '995e0722-4118-4f8e-a517-82f6ea240673',
    sport: 'FOOTBALL',
    competition: 'UEFA Champions League',
    startTime: '2025-06-29T12:00:00.000Z',
    status: 'PRE',
    scores: {},
    competitors: {
      HOME: { type: 'HOME', name: 'Real Madrid' },
      AWAY: { type: 'AWAY', name: 'Barcelona' },
    },
  };

  beforeEach(() => {
    stateManager = new StateManagerService();
    vi.clearAllMocks();
  });

  it('empty ok', () => {
    const state = stateManager.getClientState();
    expect(Object.keys(state)).toHaveLength(0);
  });

  it('adds event', () => {
    stateManager.updateState([mockEvent]);
    const state = stateManager.getClientState();

    expect(Object.keys(state)).toHaveLength(1);
    expect(state[mockEvent.id]).toEqual(mockEvent);
  });

  it('updates ', () => {
    stateManager.updateState([mockEvent]);
    const updatedEvent = {
      ...mockEvent,
      status: 'LIVE',
    };

    stateManager.updateState([updatedEvent]);
    const state = stateManager.getClientState();

    expect(state[mockEvent.id].status).toBe('LIVE');
    expect(LoggerUtil.logStatusChange).toHaveBeenCalledWith(
      mockEvent.id,
      'Real Madrid vs Barcelona',
      'PRE',
      'LIVE'
    );
  });

  it('updates score', () => {
    //initial e
    const initialEvent = {
      ...mockEvent,
      status: 'LIVE',
      scores: {
        CURRENT: {
          type: 'CURRENT',
          home: '0',
          away: '0',
        },
      },
    };

    stateManager.updateState([initialEvent]);
    // update
    const updatedEvent = {
      ...initialEvent,
      scores: {
        CURRENT: {
          type: 'CURRENT',
          home: '1',
          away: '0',
        },
      },
    };

    stateManager.updateState([updatedEvent]);
    const state = stateManager.getClientState();

    expect(state[mockEvent.id].scores.CURRENT).toEqual({
      type: 'CURRENT',
      home: '1',
      away: '0',
    });
    expect(LoggerUtil.logScoreChange).toHaveBeenCalledWith(
      mockEvent.id,
      'Real Madrid vs Barcelona',
      initialEvent.scores,
      updatedEvent.scores
    );
  });

  it('handles removed', () => {
    // add the event
    stateManager.updateState([mockEvent]);
    expect(stateManager.getClientState()[mockEvent.id]).toBeDefined();

    stateManager.updateState([]);
    const state = stateManager.getClientState();

    // e should not be in client state when removed
    expect(state[mockEvent.id]).toBeUndefined();
    expect(LoggerUtil.logStatusChange).toHaveBeenCalledWith(
      mockEvent.id,
      'Real Madrid vs Barcelona',
      'PRE',
      'REMOVED'
    );
  });

  it('filters removed', () => {
    const liveEvent = {
      ...mockEvent,
      status: 'LIVE',
    };

    const removedEvent = {
      ...mockEvent,
      id: 'removed-event-id',
      status: 'REMOVED',
    };

    stateManager.updateState([liveEvent, removedEvent]);
    const clientState = stateManager.getClientState();

    // only live event
    expect(Object.keys(clientState)).toHaveLength(1);
    expect(clientState[liveEvent.id]).toBeDefined();
    expect(clientState['removed-event-id']).toBeUndefined();
  });
});
