export interface AppConfig {
    apiClient: {
        baseUrl: string;
        maxRetries: number;
        retryDelay: number;
    };
}

export interface ApiStateResponse {
    odds: string;
}

export interface ApiMappingsResponse {
    mappings: string;
}

export interface ParsedMapping {
    [key: string]: string;
}

export interface ScoreData {
    type: string;
    home: string;
    away: string;
}

export interface CompetitorData {
    type: 'HOME' | 'AWAY';
    name: string;
}

export interface SportEvent {
    id: string;
    status: string;
    scores: { [key: string]: ScoreData };
    startTime: string;
    sport: string;
    competitors: {
        HOME: CompetitorData;
        AWAY: CompetitorData;
    };
    competition: string;
}

export interface ApplicationState {
    [eventId: string]: SportEvent;
}

export interface RawSportEventData {
    id: string;
    sportId: string;
    competitionId: string;
    startTime: string;
    homeCompetitorId: string;
    awayCompetitorId: string;
    statusId: string;
    scores: string;
}

export interface SyncedApiData {
    state: ApiStateResponse;
    mappings: ApiMappingsResponse;
}
