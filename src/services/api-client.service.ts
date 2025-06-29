import { ApiStateResponse, ApiMappingsResponse, SyncedApiData } from '../types';
import { ApiResponseModel } from '../models/api-response.model';
import { LoggerUtil } from '../utils/logger.util';
import { appConfig } from '../config/app.config';

export class ApiClientService {
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    baseUrl: string = appConfig.apiClient.baseUrl,
    maxRetries: number = appConfig.apiClient.maxRetries,
    retryDelay: number = appConfig.apiClient.retryDelay
  ) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async fetchSynchronizedData(): Promise<SyncedApiData> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const [stateResponse, mappingsResponse] = await Promise.all([
          this.fetchState(),
          this.fetchMappings(),
        ]);

        // validate data
        if (this.validateDataConsistency(stateResponse, mappingsResponse)) {
          return {
            state: stateResponse,
            mappings: mappingsResponse,
          };
        } else {
          throw new Error('Data consistency validation failed');
        }
      } catch (error) {
        lastError = error as Error;
        LoggerUtil.logRetryAttempt(attempt, lastError.message);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay);
        }
      }
    }

    throw new Error(
      `Failed to fetch synchronized data after ${this.maxRetries} atempts: ${lastError?.message}`
    );
  }

  private async fetchState(): Promise<ApiStateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/state`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!ApiResponseModel.validateStateResponse(data)) {
        throw new Error('Invalid state response format');
      }

      return data;
    } catch (error) {
      LoggerUtil.logApiError('/api/state', error);
      throw error;
    }
  }

  private async fetchMappings(): Promise<ApiMappingsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mappings`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!ApiResponseModel.validateMappingsResponse(data)) {
        throw new Error('Invalid mappings response format');
      }

      return data;
    } catch (error) {
      LoggerUtil.logApiError('/api/mappings', error);
      throw error;
    }
  }

  private validateDataConsistency(
    state: ApiStateResponse,
    mappings: ApiMappingsResponse
  ): boolean {
    //some basic validatiion :)
    if (
      !state.odds ||
      state.odds.length === 0 ||
      !mappings.mappings ||
      mappings.mappings.length === 0
    ) {
      return false;
    }

    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
