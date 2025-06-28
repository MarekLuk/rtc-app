import { AppConfig } from '../types/index';

export const appConfig: AppConfig = {
  apiClient: {
    // we can use .env file to store the API_BASE_URL, API_MAX_RETRIES, API_RETRY_DELAY
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    maxRetries: parseInt(process.env.API_MAX_RETRIES || '5', 10),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
  },
};
