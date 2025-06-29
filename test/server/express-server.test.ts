import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpressServer } from '../../src/server/express-server';
import { StateManagerService } from '../../src/services/state-manager.service';
import type { SportEvent } from '../../src/types';

const consoleSpy = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// Mock Express
let routeHandler: Function;
const mockExpress = {
  get: vi.fn((path, handler) => {
    routeHandler = handler;
  }),
  listen: vi.fn((port, callback) => {
    callback();
    return { close: vi.fn() };
  }),
};

vi.mock('express', () => ({
  default: vi.fn(() => mockExpress),
}));

describe('ExpressServer', () => {
  let server: ExpressServer;
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
    vi.clearAllMocks();
    stateManager = new StateManagerService();
    server = new ExpressServer(stateManager);
  });

  it('starts server on default port', async () => {
    await server.start();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      'Server is running on port 3001'
    );
  });

  it('starts server on custom port', async () => {
    process.env.PORT = '4000';
    server = new ExpressServer(stateManager);
    await server.start();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      'Server is running on port 4000'
    );
    delete process.env.PORT;
  });

  it('serves client state', async () => {
    stateManager.updateState([mockEvent]);

    let responseData: any;
    let statusCode = 200;
    const mockResponse = {
      json: vi.fn((data) => {
        responseData = data;
      }),
      status: vi.fn((code) => {
        statusCode = code;
        return mockResponse;
      }),
    };

    await routeHandler({}, mockResponse);

    expect(statusCode).toBe(200);
    expect(responseData[mockEvent.id]).toEqual(mockEvent);
  });

  it('handles errors when serving state', async () => {
    const mockError = new Error('Test error');
    vi.spyOn(stateManager, 'getClientState').mockImplementation(() => {
      throw mockError;
    });

    let responseData: any;
    let statusCode = 200;
    const mockResponse = {
      json: vi.fn((data) => {
        responseData = data;
      }),
      status: vi.fn((code) => {
        statusCode = code;
        return mockResponse;
      }),
    };

    await routeHandler({}, mockResponse);

    expect(statusCode).toBe(500);
    expect(responseData).toEqual({ error: 'Internal server error' });
    expect(consoleSpy.error).toHaveBeenCalledWith(
      'Error serving client state:',
      mockError
    );
  });
});
