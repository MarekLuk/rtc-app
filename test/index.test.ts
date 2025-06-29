import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Application } from '../src/index';
import type { SportEvent } from '../src/types';

const consoleSpy = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// mocks for services
const mockEvent: SportEvent = {
  id: '3eccf850-571f-4e18-8cb3-2c9e3afade7b',
  sport: 'FOOTBALL',
  competition: 'TEST',
  startTime: '2025-06-29T18:00:00Z',
  status: 'PRE',
  scores: {},
  competitors: {
    HOME: { type: 'HOME', name: 'Juventus' },
    AWAY: { type: 'AWAY', name: 'Paris Saint-Germain' },
  },
};

const mockApiClient = {
  fetchSynchronizedData: vi.fn().mockResolvedValue({
    state: { odds: 'test' },
    mappings: { mappings: 'test' },
  }),
};

const mockExpressServer = { start: vi.fn().mockResolvedValue(undefined) };
const mockStateManager = { updateState: vi.fn() };

vi.mock('../src/services/api-client.service', () => ({
  ApiClientService: vi.fn().mockImplementation(() => mockApiClient),
}));
vi.mock('../src/services/event-processor.service', () => ({
  EventProcessorService: vi.fn().mockImplementation(() => ({
    processApiData: vi.fn().mockReturnValue([mockEvent]),
  })),
}));
vi.mock('../src/server/express-server', () => ({
  ExpressServer: vi.fn().mockImplementation(() => mockExpressServer),
}));
vi.mock('../src/services/state-manager.service', () => ({
  StateManagerService: vi.fn().mockImplementation(() => mockStateManager),
}));

describe('Application', () => {
  let app: Application;
  let setI: ReturnType<typeof vi.fn>;
  let clearI: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setI = vi.fn();
    clearI = vi.fn();
    vi.stubGlobal('setInterval', setI);
    vi.stubGlobal('clearInterval', clearI);
    app = new Application();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts app', async () => {
    await app.start();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      'Application started successfully'
    );
    expect(setI).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('startup error', async () => {
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    mockExpressServer.start.mockRejectedValueOnce(new Error('fail'));
    await app.start();
    expect(consoleSpy.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('poll error', async () => {
    mockApiClient.fetchSynchronizedData.mockRejectedValueOnce(
      new Error('oops')
    );
    await app.start();
    const [[cb]] = setI.mock.calls;
    await cb();
    expect(consoleSpy.error).toHaveBeenCalledWith(
      'Polling error:',
      expect.any(Error)
    );
  });

  it('stops polling', async () => {
    setI.mockReturnValue(42);
    await app.start();
    app.stop();
    expect(clearI).toHaveBeenCalledWith(42);
  });

  it('updates state', async () => {
    await app.start();
    const [[cb]] = setI.mock.calls;
    await cb();
    expect(mockStateManager.updateState).toHaveBeenCalledWith([mockEvent]);
  });
});
