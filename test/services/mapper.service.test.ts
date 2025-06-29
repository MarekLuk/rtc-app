import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapperService } from '../../src/services/mapper.service';
import type { ApiMappingsResponse } from '../../src/types';

const consoleSpy = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

vi.mock('../../src/utils/logger.util', () => ({
  LoggerUtil: {
    logMappingChange: vi.fn(),
    logApiError: vi.fn(),
  },
}));

vi.mock('../../src/models/mapping.model', () => {
  let currentMappings = '{}';

  return {
    MappingModel: class {
      static fromApiResponse(response: ApiMappingsResponse) {
        currentMappings = response.mappings;
        return new this();
      }

      isEmpty() {
        return currentMappings === '{}';
      }

      getValue(id: string) {
        return JSON.parse(currentMappings)[id];
      }

      validateRequiredMappings(ids: string[]) {
        const mappings = JSON.parse(currentMappings);
        const missing = ids.filter((id) => !mappings[id]);
        return { isValid: missing.length === 0, missing };
      }

      getAllMappings() {
        return JSON.parse(currentMappings);
      }

      size() {
        return Object.keys(JSON.parse(currentMappings)).length;
      }
    },
  };
});

describe('MapperService', () => {
  let mapper: MapperService;

  beforeEach(() => {
    mapper = new MapperService();
    vi.clearAllMocks();
  });

  it('empty ok', () => {
    const data: ApiMappingsResponse = { mappings: '{}' };
    mapper.updateMappings(data);
    expect(mapper.getAllMappings()).toEqual({});
    expect(consoleSpy.warn).toHaveBeenCalledWith(
      'Received empty mappings from API'
    );
  });

  it('adds new mappings', () => {
    const data: ApiMappingsResponse = {
      mappings: JSON.stringify({
        'c0a1f678-dbe5-4cc8-aa52-8c822dc65267': 'FOOTBALL',
        'c72cbbc8-bac9-4cb7-a305-9a8e7c011817': 'BASKETBALL',
      }),
    };
    mapper.updateMappings(data);
    expect(mapper.getMappingValue('c0a1f678-dbe5-4cc8-aa52-8c822dc65267')).toBe(
      'FOOTBALL'
    );
    expect(mapper.getMappingValue('c72cbbc8-bac9-4cb7-a305-9a8e7c011817')).toBe(
      'BASKETBALL'
    );
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('Mappings updated successfully')
    );
  });

  it('missing ids', () => {
    const data: ApiMappingsResponse = {
      mappings: JSON.stringify({
        '29190088-763e-4d1c-861a-d16dbfcf858c': 'Real Madrid',
        '33ff69aa-c714-470c-b90d-d3883c95adce': 'Barcelona',
      }),
    };
    mapper.updateMappings(data);

    const result = mapper.validateEventMappings(
      'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
      'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
      '29190088-763e-4d1c-861a-d16dbfcf858c',
      '33ff69aa-c714-470c-b90d-d3883c95adce',
      '7fa4e60c-71ad-4e76-836f-5c2bc6602156'
    );

    expect(result.isValid).toBe(false);
    expect(result.missingMappings).toEqual([
      'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
      'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
      '7fa4e60c-71ad-4e76-836f-5c2bc6602156',
    ]);
    expect(result.resolvedMappings).toEqual({
      sport: undefined,
      competition: undefined,
      home: 'Real Madrid',
      away: 'Barcelona',
      status: undefined,
    });
  });

  it('all ok', () => {
    const data: ApiMappingsResponse = {
      mappings: JSON.stringify({
        'c0a1f678-dbe5-4cc8-aa52-8c822dc65267': 'FOOTBALL',
        'c3215a44-efdb-49fb-9f01-85b26c57bbd4': 'UEFA Champions League',
        '29190088-763e-4d1c-861a-d16dbfcf858c': 'Real Madrid',
        '33ff69aa-c714-470c-b90d-d3883c95adce': 'Barcelona',
        '7fa4e60c-71ad-4e76-836f-5c2bc6602156': 'LIVE',
      }),
    };
    mapper.updateMappings(data);

    const result = mapper.validateEventMappings(
      'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
      'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
      '29190088-763e-4d1c-861a-d16dbfcf858c',
      '33ff69aa-c714-470c-b90d-d3883c95adce',
      '7fa4e60c-71ad-4e76-836f-5c2bc6602156'
    );

    expect(result.isValid).toBe(true);
    expect(result.missingMappings).toEqual([]);
    expect(result.resolvedMappings).toEqual({
      sport: 'FOOTBALL',
      competition: 'UEFA Champions League',
      home: 'Real Madrid',
      away: 'Barcelona',
      status: 'LIVE',
    });
  });

  it('bad data', () => {
    const error = new Error('Invalid format');
    vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw error;
    });

    const data: ApiMappingsResponse = { mappings: 'invalid json' };

    expect(() => mapper.updateMappings(data)).toThrow(
      'Mapping update failed: Invalid format'
    );
    expect(consoleSpy.error).toHaveBeenCalledWith(
      'Failed to update mappings:',
      error
    );
  });

  it('changes ok', () => {
    mapper.updateMappings({
      mappings: JSON.stringify({
        '29190088-763e-4d1c-861a-d16dbfcf858c': 'Real Madrid',
        '33ff69aa-c714-470c-b90d-d3883c95adce': 'Barcelona',
      }),
    });

    mapper.updateMappings({
      mappings: JSON.stringify({
        '29190088-763e-4d1c-861a-d16dbfcf858c': 'Real Madrid',
        '33ff69aa-c714-470c-b90d-d3883c95adce': 'Barcelona',
        '6acec751-8fc4-4c44-8798-1182699869d0': 'Los Angeles Lakers',
        '9012f4c9-1d9c-4137-a60d-94b853972c7e': 'Golden State Warriors',
      }),
    });

    const mappings = mapper.getAllMappings();
    expect(mappings['6acec751-8fc4-4c44-8798-1182699869d0']).toBe(
      'Los Angeles Lakers'
    );
    expect(mappings['9012f4c9-1d9c-4137-a60d-94b853972c7e']).toBe(
      'Golden State Warriors'
    );
  });

  it('not found', () => {
    expect(mapper.getMappingValue('nonexistent-id')).toBeUndefined();
  });

  it('bad json', () => {
    const data: ApiMappingsResponse = { mappings: 'invalid json' };
    expect(() => mapper.updateMappings(data)).toThrow();
  });
});
