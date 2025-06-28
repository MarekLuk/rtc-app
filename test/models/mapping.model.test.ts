import { test, expect } from 'vitest';
import { MappingModel } from '../../src/models/mapping.model';

test('empty', () => {
  const m = new MappingModel();
  expect(m.isEmpty()).toBe(true);
  expect(m.size()).toBe(0);
});

test('lookup', () => {
  const m = new MappingModel({ two: 'one' });
  expect(m.getValue('two')).toBe('one');
  expect(m.hasMapping('two')).toBe(true);
  expect(m.hasMapping('three')).toBe(false);
});

test('from API', () => {
  const m = MappingModel.fromApiResponse({ mappings: 'a:1;b:2' });
  expect(m.size()).toBe(2);
  expect(m.getValue('b')).toBe('2');
});

test('validate required', () => {
  const m = new MappingModel({ c: '1' });
  const { isValid, missing } = m.validateRequiredMappings(['c', 'd']);
  expect(isValid).toBe(false);
  expect(missing).toEqual(['d']);
});
