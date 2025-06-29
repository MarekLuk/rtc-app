import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventProcessorService } from '../../src/services/event-processor.service';
import { SyncedApiData, RawSportEventData, SportEvent } from '../../src/types';
import { ParserUtil } from '../../src/utils/parser.util';
import { SportEventModel } from '../../src/models/sport-event.model';
import { MapperService } from '../../src/services/mapper.service';

describe('EventProcessorService', () => {
  let eventProcessor: EventProcessorService;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock parser
    vi.spyOn(ParserUtil, 'parseOddsData').mockImplementation(
      (oddsStr: string) => {
        return oddsStr
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            const [
              id,
              sportId,
              competitionId,
              startTime,
              homeCompetitorId,
              awayCompetitorId,
              statusId,
              scores,
            ] = line.split(',');

            return {
              id,
              sportId,
              competitionId,
              startTime,
              homeCompetitorId,
              awayCompetitorId,
              statusId,
              scores: scores || '',
            } as RawSportEventData;
          });
      }
    );
    // Mock SportEventModel
    vi.spyOn(SportEventModel, 'create').mockImplementation(
      (raw: RawSportEventData, maps: { [key: string]: string }) =>
        ({
          id: raw.id,
          sport: maps.sports[raw.sportId],
          competition: maps.competitions[raw.competitionId],
          competitors: {
            HOME: { name: maps.competitors[raw.homeCompetitorId] },
            AWAY: { name: maps.competitors[raw.awayCompetitorId] },
          },
          status: maps.statuses[raw.statusId],
          scores: parseScores(raw.scores),
          startTime: raw.startTime,
        }) as SportEvent
    );

    // Create mock mapper
    const mockMapperService = {
      updateMappings: (data: any) => {},
      validateEventMappings: () => ({ isValid: true, missingMappings: [] }),
      getAllMappings: () => {
        return {
          sports: {
            'c0a1f678-dbe5-4cc8-aa52-8c822dc65267': 'FOOTBALL',
            'c72cbbc8-bac9-4cb7-a305-9a8e7c011817': 'BASKETBALL',
          },
          competitions: {
            '7ee17545-acd2-4332-869b-1bef06cfaec8': 'UEFA Europa League',
            '194e22c6-53f3-4f36-af06-53f168ebeee8': 'NBA - pre-season',
          },
          competitors: {
            '29190088-763e-4d1c-861a-d16dbfcf858c': 'Real Madrid',
            '3cd8eeee-a57c-48a3-845f-93b561a95782': 'Bayern Munich',
            'd6fdf482-8151-4651-92c2-16e9e8ea4b8b': 'Manchester City',
            'b582b685-e75c-4139-8274-d19f078eabef': 'Manchester United',
          },
          statuses: {
            'ac68a563-e511-4776-b2ee-cd395c7dc424': 'PRE',
            '7fa4e60c-71ad-4e76-836f-5c2bc6602156': 'LIVE',
          },
        };
      },
      currentMappings: {},
      lastUpdated: 0,
      getMappingValue: () => '',
      hasMappingsChanged: () => false,
      logMappingChanges: () => {},
    } as unknown as MapperService;

    eventProcessor = new EventProcessorService(mockMapperService);
  });

  function parseScores(scoresStr: string): any {
    if (!scoresStr) return {};

    const periods = scoresStr.split('|');
    const scores: any = {};

    periods.forEach((period) => {
      const [periodId, score] = period.split('@');
      const [home, away] = score.split(':');
      scores[periodId] = { home, away };
    });

    return scores;
  }

  it('single event ', () => {
    const mockOdds =
      '995e0722-4118-4f8e-a517-82f6ea240673,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900432183,29190088-763e-4d1c-861a-d16dbfcf858c,3cd8eeee-a57c-48a3-845f-93b561a95782,ac68a563-e511-4776-b2ee-cd395c7dc424,';

    const mockMappings =
      '29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;3cd8eeee-a57c-48a3-845f-93b561a95782:Bayern Munich;c0a1f678-dbe5-4cc8-aa52-8c822dc65267:FOOTBALL;7ee17545-acd2-4332-869b-1bef06cfaec8:UEFA Europa League;ac68a563-e511-4776-b2ee-cd395c7dc424:PRE';

    const syncedData = {
      state: { odds: mockOdds },
      mappings: { mappings: mockMappings },
    } as SyncedApiData;

    const result = eventProcessor.processApiData(syncedData);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: '995e0722-4118-4f8e-a517-82f6ea240673',
      sport: 'FOOTBALL',
      competition: 'UEFA Europa League',
      competitors: {
        HOME: { name: 'Real Madrid' },
        AWAY: { name: 'Bayern Munich' },
      },
      status: 'PRE',
    });
  });

  it('multiple events', () => {
    const mockOdds = [
      '995e0722-4118-4f8e-a517-82f6ea240673,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900432183,29190088-763e-4d1c-861a-d16dbfcf858c,3cd8eeee-a57c-48a3-845f-93b561a95782,ac68a563-e511-4776-b2ee-cd395c7dc424,',
      '4bb7b78f-6a23-43d0-a61a-1341f03f64e0,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,194e22c6-53f3-4f36-af06-53f168ebeee8,1709900380135,d6fdf482-8151-4651-92c2-16e9e8ea4b8b,b582b685-e75c-4139-8274-d19f078eabef,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@1:2|6c036000-6dd9-485d-97a1-e338e6a32a51@1:2',
    ].join('\n');

    const mockMappings = [
      '29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid',
      '3cd8eeee-a57c-48a3-845f-93b561a95782:Bayern Munich',
      'd6fdf482-8151-4651-92c2-16e9e8ea4b8b:Manchester City',
      'b582b685-e75c-4139-8274-d19f078eabef:Manchester United',
      'c0a1f678-dbe5-4cc8-aa52-8c822dc65267:FOOTBALL',
      '7ee17545-acd2-4332-869b-1bef06cfaec8:UEFA Europa League',
      '194e22c6-53f3-4f36-af06-53f168ebeee8:NBA - pre-season',
      'ac68a563-e511-4776-b2ee-cd395c7dc424:PRE',
      '7fa4e60c-71ad-4e76-836f-5c2bc6602156:LIVE',
    ].join(';');

    const syncedData = {
      state: { odds: mockOdds },
      mappings: { mappings: mockMappings },
    } as SyncedApiData;

    const result = eventProcessor.processApiData(syncedData);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '995e0722-4118-4f8e-a517-82f6ea240673',
      sport: 'FOOTBALL',
      competition: 'UEFA Europa League',
      competitors: {
        HOME: { name: 'Real Madrid' },
        AWAY: { name: 'Bayern Munich' },
      },
      status: 'PRE',
      scores: {},
    });

    expect(result[1]).toMatchObject({
      id: '4bb7b78f-6a23-43d0-a61a-1341f03f64e0',
      sport: 'FOOTBALL',
      competition: 'NBA - pre-season',
      competitors: {
        HOME: { name: 'Manchester City' },
        AWAY: { name: 'Manchester United' },
      },
      status: 'LIVE',
      scores: {
        'e2d12fef-ae82-4a35-b389-51edb8dc664e': { home: '1', away: '2' },
        '6c036000-6dd9-485d-97a1-e338e6a32a51': { home: '1', away: '2' },
      },
    });
  });
});
