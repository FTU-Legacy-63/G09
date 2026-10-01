import assert from 'node:assert/strict';
import test from 'node:test';
import { chartSegments, dateTime, nearestDateIndex, tooltipPosition } from './chart-utils.mjs';

test('missing benchmark and long date gaps break paths, never become zero values', () => {
  assert.deepEqual(chartSegments([100, null, 120, 130], ['2022-10-24', '2022-10-25', '2025-01-13', '2025-01-14']), [[0], [2, 3]]);
  assert.deepEqual(chartSegments([100, 120, 130], ['2022-10-24', '2025-01-13', '2025-01-14']), [[0], [1, 2]]);
});

test('hover maps to nearest calendar date rather than evenly spaced record index', () => {
  const times = ['2022-10-24', '2025-01-13', '2025-01-14'].map(dateTime);
  assert.equal(nearestDateIndex(times, dateTime('2022-10-25')), 0);
  assert.equal(nearestDateIndex(times, dateTime('2025-01-12')), 1);
});

test('tooltip follows Y and flips inside chart edges', () => {
  assert.notEqual(tooltipPosition(100, 20, 800, 320, 210, 130).top, tooltipPosition(100, 70, 800, 320, 210, 130).top);
  const position = tooltipPosition(790, 310, 800, 320, 210, 130);
  assert.ok(position.left >= 8 && position.left + 210 <= 792);
  assert.ok(position.top >= 8 && position.top + 130 <= 312);
});
