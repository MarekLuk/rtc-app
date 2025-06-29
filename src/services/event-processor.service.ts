import { SyncedApiData, SportEvent } from '../types';
import { ParserUtil } from '../utils/parser.util';
import { SportEventModel } from '../models/sport-event.model';
import { MapperService } from './mapper.service';
import { LoggerUtil } from '../utils/logger.util';

export class EventProcessorService {
  private mapperService: MapperService;

  constructor(mapperService: MapperService) {
    this.mapperService = mapperService;
  }

  processApiData(syncedData: SyncedApiData): SportEvent[] {
    // update mappings
    this.mapperService.updateMappings(syncedData.mappings);

    // parse raw events
    const rawEvents = ParserUtil.parseOddsData(syncedData.state.odds);

    const processedEvents: SportEvent[] = [];

    for (const rawEvent of rawEvents) {
      const validationResult = this.mapperService.validateEventMappings(
        rawEvent.sportId,
        rawEvent.competitionId,
        rawEvent.homeCompetitorId,
        rawEvent.awayCompetitorId,
        rawEvent.statusId
      );

      if (!validationResult.isValid) {
        LoggerUtil.logMappingError(
          rawEvent.id,
          validationResult.missingMappings
        );
        continue;
      }

      const sportEvent = SportEventModel.create(
        rawEvent,
        this.mapperService.getAllMappings()
      );

      if (sportEvent) {
        processedEvents.push(sportEvent);
      } else {
        LoggerUtil.logMappingError(rawEvent.id, [
          'Failed to create sport event',
        ]);
      }
    }

    return processedEvents;
  }
}
