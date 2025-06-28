import { ParsedMapping, ApiMappingsResponse } from '../types';
import { ParserUtil } from '../utils/parser.util';

export class MappingModel {
  private mappings: ParsedMapping;

  constructor(mappings: ParsedMapping = {}) {
    this.mappings = mappings;
  }

  static fromApiResponse(response: ApiMappingsResponse): MappingModel {
    const parsedMappings = ParserUtil.parseMappings(response.mappings || '');
    return new MappingModel(parsedMappings);
  }

  getValue(id: string): string | undefined {
    return this.mappings[id];
  }

  hasMapping(id: string): boolean {
    return id in this.mappings;
  }

  getAllMappings(): ParsedMapping {
    return { ...this.mappings };
  }

  validateRequiredMappings(requiredIds: string[]): {
    isValid: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    for (const id of requiredIds) {
      if (!this.hasMapping(id)) {
        missing.push(id);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
    };
  }

  size(): number {
    return Object.keys(this.mappings).length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }
}
