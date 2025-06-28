export class LoggerUtil {
    static logScoreChange(eventId: string, eventName: string, oldScore: any, newScore: any): void {
        console.log(`[SCORE CHANGE] Event: ${eventName} (${eventId})`);
        console.log(`  Old Score: ${JSON.stringify(oldScore)}`);
        console.log(`  New Score: ${JSON.stringify(newScore)}`);
    }

    static logStatusChange(eventId: string, eventName: string, oldStatus: string, newStatus: string): void {
        console.log(`[STATUS CHANGE] Event: ${eventName} (${eventId})`);
        console.log(`  Old Status: ${oldStatus}`);
        console.log(`  New Status: ${newStatus}`);
    }

    static logMappingError(eventId: string, missingMappings: string[]): void {
        console.error(`[MAPPING ERROR] Event ${eventId} skipped due to missing mappings:`);
        console.error(`  Missing: ${missingMappings.join(', ')}`);
    }

    static logApiError(endpoint: string, error: any): void {
        console.error(`[API ERROR] Failed to fetch ${endpoint}:`, error.message);
    }

    static logRetryAttempt(attempt: number, reason: string): void {
        console.warn(`[RETRY] Attempt ${attempt}: ${reason}`);
    }

    static logMappingChange(changeType: 'ADDED' | 'CHANGED' | 'REMOVED', mappings: string[]): void {
        console.log(`[MAPPING ${changeType}] ${mappings.join(', ')}`);
    }
}