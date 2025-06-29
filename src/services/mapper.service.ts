import { ApiMappingsResponse, ParsedMapping } from '../types';
import { MappingModel } from '../models/mapping.model';
import { LoggerUtil } from '../utils/logger.util';

export class MapperService {
  private currentMappings: MappingModel;
  private lastUpdated: Date | null = null;

  constructor() {
    this.currentMappings = new MappingModel();
  }

  updateMappings(apiResponse: ApiMappingsResponse): void {
    try {
      const newMappings = MappingModel.fromApiResponse(apiResponse);

      if (newMappings.isEmpty()) {
        console.warn('Received empty mappings from API');
        return;
      }

      const hasChanged = this.hasMappingsChanged(newMappings);

      if (hasChanged) {
        this.logMappingChanges(this.currentMappings, newMappings);
      }

      this.currentMappings = newMappings;
      this.lastUpdated = new Date();

      console.log(
        `Mappings updated successfully. Total mappings: ${this.currentMappings.size()}`
      );
    } catch (error) {
      console.error('Failed to update mappings:', error);
      throw new Error(
        `Mapping update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getMappingValue(id: string): string | undefined {
    return this.currentMappings.getValue(id);
  }

  validateEventMappings(
    sportId: string,
    competitionId: string,
    homeId: string,
    awayId: string,
    statusId: string
  ): {
    isValid: boolean;
    missingMappings: string[];
    resolvedMappings: {
      sport?: string;
      competition?: string;
      home?: string;
      away?: string;
      status?: string;
    };
  } {
    const requiredIds = [sportId, competitionId, homeId, awayId, statusId];
    const validation =
      this.currentMappings.validateRequiredMappings(requiredIds);

    const resolvedMappings = {
      sport: this.getMappingValue(sportId),
      competition: this.getMappingValue(competitionId),
      home: this.getMappingValue(homeId),
      away: this.getMappingValue(awayId),
      status: this.getMappingValue(statusId),
    };

    return {
      isValid: validation.isValid,
      missingMappings: validation.missing,
      resolvedMappings,
    };
  }

  getAllMappings(): ParsedMapping {
    return this.currentMappings.getAllMappings();
  }

  private hasMappingsChanged(newMappings: MappingModel): boolean {
    if (this.currentMappings.isEmpty()) {
      return true;
    }

    const currentMappingsData = this.currentMappings.getAllMappings();
    const newMappingsData = newMappings.getAllMappings();

    // compare sizes first
    if (
      Object.keys(currentMappingsData).length !==
      Object.keys(newMappingsData).length
    ) {
      return true;
    }

    // compare content
    for (const [id, value] of Object.entries(newMappingsData)) {
      if (currentMappingsData[id] !== value) {
        return true;
      }
    }

    return false;
  }

  private logMappingChanges(
    oldMappings: MappingModel,
    newMappings: MappingModel
  ): void {
    const oldData = oldMappings.getAllMappings();
    const newData = newMappings.getAllMappings();

    const added: string[] = [];
    const changed: string[] = [];
    const removed: string[] = [];

    // find added and changed mappings
    for (const [id, value] of Object.entries(newData)) {
      if (!(id in oldData)) {
        added.push(`${id}:${value}`);
      } else if (oldData[id] !== value) {
        changed.push(`${id}:${oldData[id]} -> ${value}`);
      }
    }

    // find removed mappings
    for (const [id, value] of Object.entries(oldData)) {
      if (!(id in newData)) {
        removed.push(`${id}:${value}`);
      }
    }

    if (added.length > 0) {
      LoggerUtil.logMappingChange('ADDED', added);
    }
    if (changed.length > 0) {
      LoggerUtil.logMappingChange('CHANGED', changed);
    }
    if (removed.length > 0) {
      LoggerUtil.logMappingChange('REMOVED', removed);
    }
  }
}
