import { ParsedMapping, RawSportEventData } from '../types';

export class ParserUtil {
  static parseMappings(mappingsString: string): ParsedMapping {
    const mappings: ParsedMapping = {};

    if (!mappingsString) {
      return mappings;
    }
    try {
      const pairs = mappingsString.split(';');
      for (const pair of pairs) {
        const [id, value] = pair.split(':');
        if (id && value) {
          mappings[id] = value;
        }
      }
    } catch (error) {
      console.error('Error parsing mappings:', error);
    }

    return mappings;
  }

  static parseOddsData(oddsString: string): RawSportEventData[] {
    const events: RawSportEventData[] = [];

    if (!oddsString) {
      return events;
    }
    try {
      const lines = oddsString.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        const fields = line.split(',');
        if (fields.length >= 7) {
          events.push({
            id: fields[0],
            sportId: fields[1],
            competitionId: fields[2],
            startTime: fields[3],
            homeCompetitorId: fields[4],
            awayCompetitorId: fields[5],
            statusId: fields[6],
            scores: fields[7] || '',
          });
        }
      }
    } catch (error) {
      console.error('Error parsing odds data:', error);
    }
    return events;
  }
}
