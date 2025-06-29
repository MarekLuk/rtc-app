import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ApiClientService } from '../../src/services/api-client.service';
import { ApiStateResponse, ApiMappingsResponse } from '../../src/types';

vi.mock('../../src/config/app.config', () => ({
  appConfig: {
    apiClient: {
      baseUrl: 'http://test',
      maxRetries: 2,
      retryDelay: 0,
    },
  },
}));

function makeResponse(data: any, status = 200) {
  return Promise.resolve(
    new Response(status === 200 ? JSON.stringify(data) : null, {
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

let fetchCalls: Array<Promise<Response>> = [];
let currentCall = 0;

beforeEach(() => {
  currentCall = 0;
  vi.stubGlobal('fetch', () => fetchCalls[currentCall++]);
});

afterEach(() => {
  vi.restoreAllMocks();
  fetchCalls = [];
});

describe('ApiClientService test', () => {
  const api = new ApiClientService();

  it('ok path', async () => {
    fetchCalls = [
      makeResponse({ odds: '[]' }),
      makeResponse({ mappings: '{}' }),
    ];

    const result = await api.fetchSynchronizedData();
    expect(result.state.odds).toBe('[]');
    expect(result.mappings.mappings).toBe('{}');
  });

  it('retry works', async () => {
    fetchCalls = [
      makeResponse(null, 500),
      makeResponse(null, 500),
      makeResponse({ odds: '[]' }),
      makeResponse({ mappings: '{}' }),
    ];

    const result = await api.fetchSynchronizedData();
    expect(result.state.odds).toBe('[]');
    expect(result.mappings.mappings).toBe('{}');
  });

  it('all fails', async () => {
    fetchCalls = [
      makeResponse(null, 500),
      makeResponse(null, 500),
      makeResponse(null, 500),
      makeResponse(null, 500),
    ];

    await expect(api.fetchSynchronizedData()).rejects.toThrow(
      'Failed to fetch'
    );
  });
});
