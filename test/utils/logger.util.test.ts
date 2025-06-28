import { test, vi, expect } from 'vitest'
import { LoggerUtil } from '../../src/utils/logger.util'

test('logs score change', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  LoggerUtil.logScoreChange('Puchar', 'Moj event', 10, 20)
  expect(spy.mock.calls).toEqual([
    ['[SCORE CHANGE] Event: Moj event (Puchar)'],
    ['  Old Score: 10'],
    ['  New Score: 20'],
  ])
  spy.mockRestore()
})

test('logs status change', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  LoggerUtil.logStatusChange('Puchar', 'Moj event', 'pending', 'complete')
  expect(spy.mock.calls).toEqual([
    ['[STATUS CHANGE] Event: Moj event (Puchar)'],
    ['  Old Status: pending'],
    ['  New Status: complete'],
  ])
  spy.mockRestore()
})

test('log mapping error', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  LoggerUtil.logMappingError('Puchar', ['map1', 'map2'])
  expect(spy.mock.calls).toEqual([
    ['[MAPPING ERROR] Event Puchar skipped due to missing mappings:'],
    ['  Missing: map1, map2'],
  ])
  spy.mockRestore()
})

test('log api error', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const error = new Error('blad')
  LoggerUtil.logApiError('/endpoint', error)
  expect(spy.mock.calls).toEqual([
    ['[API ERROR] Failed to fetch /endpoint:', 'blad'],
  ])
  spy.mockRestore()
})

test('log retry attempt', () => {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  LoggerUtil.logRetryAttempt(3, 'timeout')
  expect(spy.mock.calls).toEqual([
    ['[RETRY] Attempt 3: timeout'],
  ])
  spy.mockRestore()
})

test('log mapping change', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
  LoggerUtil.logMappingChange('ADDED', ['map1', 'map2'])
  expect(spy.mock.calls).toEqual([
    ['[MAPPING ADDED] map1, map2'],
  ])
  spy.mockRestore()
})
