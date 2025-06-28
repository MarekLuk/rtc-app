import { SportEvent, RawSportEventData, ScoreData } from '../types';

export class SportEventModel {
  static create(
    rawData: RawSportEventData,
    mappings: { [key: string]: string }
  ): SportEvent | null {
    try {
      const sport = mappings[rawData.sportId];
      const competition = mappings[rawData.competitionId];
      const homeCompetitorName = mappings[rawData.homeCompetitorId];
      const awayCompetitorName = mappings[rawData.awayCompetitorId];
      const status = mappings[rawData.statusId];
    
      if (
        !sport ||
        !competition ||
        !homeCompetitorName ||
        !awayCompetitorName ||
        !status
      ) {
        return null;
      }

      const scores = this.parseScores(rawData.scores, mappings);
      if (!scores) {
        return null;
      }

      return {
        id: rawData.id,
        status,
        scores,
        startTime: new Date(parseInt(rawData.startTime)).toISOString(),
        sport,
        competitors: {
          HOME: {
            type: 'HOME',
            name: homeCompetitorName,
          },
          AWAY: {
            type: 'AWAY',
            name: awayCompetitorName,
          },
        },
        competition,
      };
    } catch (error) {
      return null;
    }
  }

  private static parseScores(
    scoresString: string,
    mappings: { [key: string]: string }
  ): { [key: string]: ScoreData } | null {
    if (!scoresString || scoresString.trim() === '') {
      return {};
    }

    try {
      const scores: { [key: string]: ScoreData } = {};
      const scoreParts = scoresString.split('|');

      for (const scorePart of scoreParts) {
        const [periodInfo, scoreInfo] = scorePart.split('@');
        if (!periodInfo || !scoreInfo) continue;

        const periodType = mappings[periodInfo];
        if (!periodType) continue;

        const [homeScore, awayScore] = scoreInfo.split(':');
        if (homeScore === undefined || awayScore === undefined) continue;

        scores[periodType] = {
          type: periodType,
          home: homeScore,
          away: awayScore,
        };
      }

      return scores;
    } catch (error) {
      return null;
    }
  }
}
