import { test, expect } from 'vitest';
import { ParserUtil } from '../../src/utils/parser.util';
import type { ParsedMapping, RawSportEventData } from '../../src/types';

const mappingsString =
  '29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;33ff69aa-c714-470c-b90d-d3883c95adce:Barcelona;b582b685-e75c-4139-8274-d19f078eabef:Manchester United;4df1b17c-3bfe-4bbb-8b60-12661c2bb190:Liverpool;3cd8eeee-a57c-48a3-845f-93b561a95782:Bayern Munich;a950b22c-989b-402f-a1ac-70df8f102e27:Paris Saint-Germain;5dbdb683-c15f-4d79-a348-03cf2861b954:Juventus;7229b223-03d6-4285-afbf-243671088a20:Chelsea;d6fdf482-8151-4651-92c2-16e9e8ea4b8b:Manchester City;f0c6f8b4-8fbc-4022-95b3-c68bca32adb9:AC Milan;6acec751-8fc4-4c44-8798-1182699869d0:Los Angeles Lakers;9012f4c9-1d9c-4137-a60d-94b853972c7e:Golden State Warriors;44bc5cb3-19c0-4f35-8ac6-100cfecf70f1:Miami Heat;e476746c-869d-4aa5-a292-587730514aae:Chicago Bulls;259ba76d-189f-420f-be50-0aac633c2153:Boston Celtics;98841461-0442-4dbb-ae53-2e039bbecad2:Houston Rockets;3138f71d-16f2-46b6-9812-d62e3fa6f981:Toronto Raptors;b98bab75-53d3-494e-a3a9-b9d1dd1fb458:Dallas Mavericks;d3fa6d41-af8c-45d1-848c-891ca86731f1:Brooklyn Nets;d34032e0-0e81-4166-8ced-dd8fd6222fcb:Denver Nuggets;c3215a44-efdb-49fb-9f01-85b26c57bbd4:UEFA Champions League;7ee17545-acd2-4332-869b-1bef06cfaec8:UEFA Europa League;28cb12c0-2542-4790-b66b-e51b9cb30c76:NBA;194e22c6-53f3-4f36-af06-53f168ebeee8:NBA - pre-season;c0a1f678-dbe5-4cc8-aa52-8c822dc65267:FOOTBALL;c72cbbc8-bac9-4cb7-a305-9a8e7c011817:BASKETBALL;ac68a563-e511-4776-b2ee-cd395c7dc424:PRE;7fa4e60c-71ad-4e76-836f-5c2bc6602156:LIVE;cb807d14-5a98-4b41-8ddc-74a1f5f80f9b:REMOVED;e2d12fef-ae82-4a35-b389-51edb8dc664e:CURRENT;6c036000-6dd9-485d-97a1-e338e6a32a51:PERIOD_1;2db8bc38-b46d-4bd9-9218-6f8dbe083517:PERIOD_2;0cfb491c-7d09-4ffc-99fb-a6ee0cf5d198:PERIOD_3;5a79d3e7-85b3-4d6b-b4bf-ddd743e7162f:PERIOD_4';

const oddsString = `995e0722-4118-4f8e-a517-82f6ea240673,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900432183,29190088-763e-4d1c-861a-d16dbfcf858c,3cd8eeee-a57c-48a3-845f-93b561a95782,ac68a563-e511-4776-b2ee-cd395c7dc424,\n4bb7b78f-6a23-43d0-a61a-1341f03f64e0,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,194e22c6-53f3-4f36-af06-53f168ebeee8,1709900380135,d6fdf482-8151-4651-92c2-16e9e8ea4b8b,b582b685-e75c-4139-8274-d19f078eabef,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@1:2|6c036000-6dd9-485d-97a1-e338e6a32a51@1:2\nfd903e06-9a7d-423d-8869-1c060cc0b62d,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900348483,a950b22c-989b-402f-a1ac-70df8f102e27,5dbdb683-c15f-4d79-a348-03cf2861b954,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@1:3|6c036000-6dd9-485d-97a1-e338e6a32a51@1:3\n449a2d53-4845-4a59-9596-4206f2504656,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900494110,f0c6f8b4-8fbc-4022-95b3-c68bca32adb9,33ff69aa-c714-470c-b90d-d3883c95adce,ac68a563-e511-4776-b2ee-cd395c7dc424,\n4c6d6c9d-2b47-433d-b2ad-a82cff214805,c0a1f678-dbe5-4cc8-aa52-8c822dc65267,28cb12c0-2542-4790-b66b-e51b9cb30c76,1709900417851,4df1b17c-3bfe-4bbb-8b60-12661c2bb190,7229b223-03d6-4285-afbf-243671088a20,ac68a563-e511-4776-b2ee-cd395c7dc424,\nb874daa4-0ee2-4030-83ac-8bf70100dbb6,c72cbbc8-bac9-4cb7-a305-9a8e7c011817,28cb12c0-2542-4790-b66b-e51b9cb30c76,1709900404465,44bc5cb3-19c0-4f35-8ac6-100cfecf70f1,98841461-0442-4dbb-ae53-2e039bbecad2,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@0:0|6c036000-6dd9-485d-97a1-e338e6a32a51@0:0\na32247cb-70a7-4d7b-a69d-37a98a512687,c72cbbc8-bac9-4cb7-a305-9a8e7c011817,194e22c6-53f3-4f36-af06-53f168ebeee8,1709900431402,9012f4c9-1d9c-4137-a60d-94b853972c7e,3138f71d-16f2-46b6-9812-d62e3fa6f981,ac68a563-e511-4776-b2ee-cd395c7dc424,\naf5d53e6-b108-48ce-b3e9-fce1c94af6c4,c72cbbc8-bac9-4cb7-a305-9a8e7c011817,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900352422,259ba76d-189f-420f-be50-0aac633c2153,6acec751-8fc4-4c44-8798-1182699869d0,7fa4e60c-71ad-4e76-836f-5c2bc6602156,e2d12fef-ae82-4a35-b389-51edb8dc664e@1:1|6c036000-6dd9-485d-97a1-e338e6a32a51@1:1|2db8bc38-b46d-4bd9-9218-6f8dbe083517@0:0\n1e9d8eee-e6a7-44c2-ad21-45f6f6d0f646,c72cbbc8-bac9-4cb7-a305-9a8e7c011817,c3215a44-efdb-49fb-9f01-85b26c57bbd4,1709900497047,d34032e0-0e81-4166-8ced-dd8fd6222fcb,e476746c-869d-4aa5-a292-587730514aae,ac68a563-e511-4776-b2ee-cd395c7dc424,\nb2ec3d30-e156-42dd-9074-61681eecd382,c72cbbc8-bac9-4cb7-a305-9a8e7c011817,7ee17545-acd2-4332-869b-1bef06cfaec8,1709900423377,d3fa6d41-af8c-45d1-848c-891ca86731f1,b98bab75-53d3-494e-a3a9-b9d1dd1fb458,ac68a563-e511-4776-b2ee-cd395c7dc424,"`;

test('parse Mappings ', () => {
  const parsed = ParserUtil.parseMappings(mappingsString);
  const pairCount = mappingsString.split(';').length;
  expect(Object.keys(parsed)).toHaveLength(pairCount);
  expect(parsed['29190088-763e-4d1c-861a-d16dbfcf858c']).toBe('Real Madrid');
  expect(parsed['6c036000-6dd9-485d-97a1-e338e6a32a51']).toBe('PERIOD_1');
});

test('parses odds data', () => {
  const events = ParserUtil.parseOddsData(oddsString);
  expect(events).toHaveLength(10);
  expect(events[0]).toEqual<RawSportEventData>({
    id: '995e0722-4118-4f8e-a517-82f6ea240673',
    sportId: 'c0a1f678-dbe5-4cc8-aa52-8c822dc65267',
    competitionId: '7ee17545-acd2-4332-869b-1bef06cfaec8',
    startTime: '1709900432183',
    homeCompetitorId: '29190088-763e-4d1c-861a-d16dbfcf858c',
    awayCompetitorId: '3cd8eeee-a57c-48a3-845f-93b561a95782',
    statusId: 'ac68a563-e511-4776-b2ee-cd395c7dc424',
    scores: '',
  });
});

test('parse Mappings returns empty object ', () => {
  expect(ParserUtil.parseMappings('')).toEqual<ParsedMapping>({});
});

test('parse ods data returns empty arr', () => {
  expect(ParserUtil.parseOddsData('')).toEqual<RawSportEventData[]>([]);
});
