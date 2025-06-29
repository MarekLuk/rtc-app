import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('appConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('falls back to defaults', async () => {
    delete process.env.API_BASE_URL;
    delete process.env.API_MAX_RETRIES;
    delete process.env.API_RETRY_DELAY;

    const { appConfig } = await import('../../src/config/app.config.js');
    expect(appConfig.apiClient.baseUrl).toBe('http://localhost:3000');
    expect(appConfig.apiClient.maxRetries).toBe(5);
    expect(appConfig.apiClient.retryDelay).toBe(1000);
  });

  it('reads from env vars', async () => {
    process.env.API_BASE_URL = 'https://api.test';
    process.env.API_MAX_RETRIES = '3';
    process.env.API_RETRY_DELAY = '2500';

    const { appConfig } = await import('../../src/config/app.config.js');
    expect(appConfig.apiClient.baseUrl).toBe('https://api.test');
    expect(appConfig.apiClient.maxRetries).toBe(3);
    expect(appConfig.apiClient.retryDelay).toBe(2500);
  });
});
