export interface AppConfig {
    apiClient: {
        baseUrl: string;
        maxRetries: number;
        retryDelay: number;
    };
}

