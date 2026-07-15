import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProductionSurface } from './production-surface-guard.mjs';

test('clean production surface passes', () => {
  assert.doesNotThrow(() => assertProductionSurface({ label: 'discovery/en', overflowPx: 1, errorCount: 0 }));
});

test('intentionally exposed error banner fails before capture', () => {
  assert.throws(
    () => assertProductionSurface({ label: 'orbit-lock/ar/instructions', errorBannerVisible: true, errorBannerText: 'رابط التحدي غير صالح' }),
    /Unexpected visible error banner/
  );
});

test('runtime request failures and horizontal overflow fail the gate', () => {
  assert.throws(() => assertProductionSurface({ label: 'mirror-fuse/tr/game', errorCount: 1 }), /Runtime or request error/);
  assert.throws(() => assertProductionSurface({ label: 'echo-grid/en/game', overflowPx: 3 }), /Horizontal overflow/);
});
