import { test, expect } from 'vitest';
import { ParserUtil } from '../../src/utils/parser.util';
import { SportEventModel } from '../../src/models/sport-event.model';
import type { RawSportEventData } from '../../src/types';

const mappingString =
  '29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;33ff69aa-c714-470c-b90d-d3883c95adce:Barcelona;b582b685-e75c-4139-8274-d19f078eabef:Manchester United;4df1b17c-3bfe-4bbb-8b60-12661c2bb190:Liverpool;3cd8eeee-a57c-48a3-845f-93b561a95782:Bayern Munich;a950b22c-989b-402f-a1ac-70df8f102e27:Paris Saint-Germain;5dbdb683-c15f-4d79-a348-03cf2861b954:Juventus;7229b223-03d6-4285-afbf-243671088a20:Chelsea;d6fdf482-8151-4651-92c2-16e9e8ea4b8b:Manchester City;f0c6f8b4-8fbc-4022-95b3-c68bca32adb9:AC Milan;6acec751-8fc4-4c44-8798-1182699869d0:Los Angeles Lakers;9012f4c9-1d9c-4137-a60d-94b853972c7e:Golden State Warriors;44bc5cb3-19c0-4f35-8ac6-100cfecf70f1:Miami Heat;e476746c-869d-4aa5-a292-587730514aae:Chicago Bulls;259ba76d-189f-420f-be50-0aac633c2153:Boston Celtics;98841461-0442-4dbb-ae53-2e039bbecad2:Houston Rockets;3138f71d-16f2-46b6-9812-d62e3fa6f981:Toronto Raptors;b98bab75-53d3-494e-a3a9-b9d1dd1fb458:Dallas Mavericks;d3fa6d41-af8c-45d1-848c-891ca86731f1:Brooklyn Nets;d34032e0-0e81-4166-8ced-dd8fd6222fcb:Denver Nuggets;c3215a44-efdb-49fb-9f01-85b26c57bbd4:UEFA Champions League;7ee17545-acd2-4332-869b-1bef06cfaec8:UEFA Europa League;28cb12c0-2542-4790-b66b-e51b9cb30c76:NBA;194e22c6-53f3-4f36-af06-53f168ebeee8:NBA - pre-season;c0a1f678-dbe5-4cc8-aa52-8c822dc65267:FOOTBALL;c72cbbc8-bac9-4cb7-a305-9a8e7c011817:BASKETBALL;ac68a563-e511-4776-b2ee-cd395c7dc424:PRE;7fa4e60c-71ad-4e76-836f-5c2bc6602156:LIVE;cb807d14-5a98-4b41-8ddc-74a1f5f80f9b:REMOVED;e2d12fef-ae82-4a35-b389-51edb8dc664e:CURRENT;6c036000-6dd9-485d-97a1-e338e6a32a51:PERIOD_1;2db8bc38-b46d-4bd9-9218-6f8dbe083517:PERIOD_2;0cfb491c-7d09-4ffc-99fb-a6ee0cf5d198:PERIOD_3;5a79d3e7-85b3-4d6b-b4bf-ddd743e7162f:PERIOD_4';
const mappings = ParserUtil.parseMappings(mappingString);

test('mapping missing', () => {
  const raw: RawSportEventData = {
    id: 'eventid',
    sportId: 'missing',
    competitionId: 'compid',
    startTime: '1751140800000',
    homeCompetitorId: '33ff69aa-c714-470c-b90d-d3883c95adce',
    awayCompetitorId: '29190088-763e-4d1c-861a-d16dbfcf858c',
    statusId: 'ac68a563-e511-4776-b2ee-cd395c7dc424',
    scores: '',
  };
  expect(SportEventModel.create(raw, mappings)).toBeNull();
});

test('no scores', () => {
  const raw: RawSportEventData = {
    id: 'eventid',
    sportId: 'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
    competitionId: 'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
    startTime: '1751140800000',
    homeCompetitorId: '33ff69aa-c714-470c-b90d-d3883c95adce',
    awayCompetitorId: '29190088-763e-4d1c-861a-d16dbfcf858c',
    statusId: 'ac68a563-e511-4776-b2ee-cd395c7dc424',
    scores: '',
  };
  const evt = SportEventModel.create(raw, mappings)!;
  expect(evt.id).toBe('eventid');
  expect(evt.sport).toBe('FOOTBALL');
  expect(evt.competition).toBe('UEFA Champions League');
  expect(evt.competitors.HOME.name).toBe('Barcelona');
  expect(evt.competitors.AWAY.name).toBe('Real Madrid');
  expect(evt.status).toBe('PRE');
  expect(evt.scores).toEqual({});
  expect(evt.startTime).toBe('2025-06-28T20:00:00.000Z');
});

test('multiple scores', () => {
  const raw: RawSportEventData = {
    id: 'eventid',
    sportId: 'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
    competitionId: 'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
    startTime: '1751140800000',
    homeCompetitorId: '33ff69aa-c714-470c-b90d-d3883c95adce',
    awayCompetitorId: '29190088-763e-4d1c-861a-d16dbfcf858c',
    statusId: 'ac68a563-e511-4776-b2ee-cd395c7dc424',
    scores:
      '6c036000-6dd9-485d-97a1-e338e6a32a51@2:0|2db8bc38-b46d-4bd9-9218-6f8dbe083517@2:2',
  };
  const evt = SportEventModel.create(raw, mappings)!;
  expect(evt.scores).toEqual({
    PERIOD_1: { type: 'PERIOD_1', home: '2', away: '0' },
    PERIOD_2: { type: 'PERIOD_2', home: '2', away: '2' },
  });
});

test('invalid date', () => {
  const raw: RawSportEventData = {
    id: 'eventid',
    sportId: 'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
    competitionId: 'c3215a44-efdb-49fb-9f01-85b26c57bbd4',
    startTime: 'invalid',
    homeCompetitorId: '33ff69aa-c714-470c-b90d-d3883c95adce',
    awayCompetitorId: '29190088-763e-4d1c-861a-d16dbfcf858c',
    statusId: 'ac68a563-e511-4776-b2ee-cd395c7dc424',
    scores:
      '6c036000-6dd9-485d-97a1-e338e6a32a51@2:0|2db8bc38-b46d-4bd9-9218-6f8dbe083517@2:2',
  };
  expect(SportEventModel.create(raw, mappings)).toBeNull();
});
