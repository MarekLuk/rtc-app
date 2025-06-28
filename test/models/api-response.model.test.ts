import { test, expect } from 'vitest';
import { ApiResponseModel } from '../../src/models/api-response.model';

test('valid state', () => {
  expect(ApiResponseModel.validateStateResponse({ odds: 'data' })).toBe(true);
});

test('invalid state', () => {
  expect(ApiResponseModel.validateStateResponse({})).toBe(false);
  expect(ApiResponseModel.validateStateResponse({ odds: 12345689 })).toBe(
    false
  );
});

test('valid mappings', () => {
  expect(
    ApiResponseModel.validateMappingsResponse({ mappings: 'a:1;c:3' })
  ).toBe(true);
});

test('invalid mappings', () => {
  expect(ApiResponseModel.validateMappingsResponse({})).toBe(false);
  expect(ApiResponseModel.validateMappingsResponse({ mappings: [] })).toBe(
    false
  );
});
