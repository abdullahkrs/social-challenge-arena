import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHARE_CARD_MAX_BYTES, assertCardBlobSize, buildFileShareData, buildResultCardModel,
  isShareCancellation, renderResultCard, resultCardFileName, supportsFileShare, supportsTextShare
} from '../src/share-card.mjs';
import { CHALLENGE_IDS } from '../src/core.mjs';
import { missingTranslations, translate } from '../src/i18n.mjs';

const labels = {
  score: 'Score', challenger: 'Challenger', you: 'You', duel: 'Head-to-head',
  outcome: 'You won by 5', callToAction: 'Can you beat it?', privacy: 'No account. No tracking.'
};

test('builds deterministic privacy-safe solo models for all challenge IDs', () => {
  for (const challengeId of CHALLENGE_IDS) {
    const first = buildResultCardModel({ challengeId, appName: 'Arena', challengeName: challengeId, score: 4321, labels });
    const second = buildResultCardModel({ challengeId, appName: 'Arena', challengeName: challengeId, score: 4321, labels });
    assert.deepEqual(first, second);
    assert.equal(first.mode, 'solo');
    assert.equal(first.playerScore, 4321);
    assert.equal(first.challengerScore, null);
    assert.equal(resultCardFileName(first), `social-challenge-${challengeId}-4321.png`);
    assert.equal(JSON.stringify(first).includes('http'), false);
  }
});

test('models invited win, loss, and tie without color-only meaning', () => {
  const cases = [[120, 100, 'win', '↑'], [80, 100, 'lose', '↓'], [100, 100, 'tie', '=']];
  for (const [score, target, outcome, symbol] of cases) {
    const model = buildResultCardModel({ challengeId: 'orbit-lock', appName: 'Arena', challengeName: 'Orbit Lock', score, challengerScore: target, labels });
    assert.equal(model.mode, 'duel');
    assert.equal(model.outcome, outcome);
    assert.equal(model.outcomeSymbol, symbol);
    assert.equal(model.challengerScore, target);
  }
});

test('preserves Arabic RTL metadata and clamps bounded scores', () => {
  const model = buildResultCardModel({ challengeId: 'echo-grid', language: 'ar', direction: 'rtl', appName: 'الساحة', challengeName: 'شبكة الصدى', score: 50000, challengerScore: -5, labels });
  assert.equal(model.direction, 'rtl');
  assert.equal(model.language, 'ar');
  assert.equal(model.playerScore, 9999);
  assert.equal(model.challengerScore, 0);
  assert.ok(model.playerScoreText.length > 0);
});

test('preserves text sharing while requiring explicit support for files', () => {
  const file = { name: 'result.png' };
  const textData = { text: 'Beat me', url: 'https://example.test' };
  assert.equal(supportsTextShare({ share() {} }, textData), true);
  assert.equal(supportsTextShare({ share() {}, canShare: () => true }, textData), true);
  assert.equal(supportsTextShare({ share() {}, canShare: () => false }, textData), false);
  assert.equal(supportsTextShare({ share() {}, canShare: () => { throw new Error('blocked'); } }, textData), false);
  assert.equal(supportsFileShare({ share() {} }, file), false);
  assert.equal(supportsFileShare({ share() {}, canShare: () => false }, file), false);
  assert.equal(supportsFileShare({ share() {}, canShare: ({ files }) => files[0] === file }, file), true);
  assert.equal(supportsFileShare({ share() {}, canShare: () => { throw new Error('blocked'); } }, file), false);
});

test('enforces generated file size bounds and cancellation semantics', () => {
  assert.equal(assertCardBlobSize(new Blob(['ok'])).size, 2);
  assert.throws(() => assertCardBlobSize(new Blob([new Uint8Array(SHARE_CARD_MAX_BYTES + 1)])), RangeError);
  assert.equal(isShareCancellation(Object.assign(new Error('cancel'), { name: 'AbortError' })), true);
  assert.equal(isShareCancellation(new Error('network')), false);
});

test('share-card status and artifact text keep Arabic, English, and Turkish parity', () => {
  assert.deepEqual(missingTranslations(), []);
  for (const language of ['ar', 'en', 'tr']) {
    for (const key of ['sharePreparing', 'shareComplete', 'shareCancelled', 'shareFallback', 'shareCardCallToAction', 'shareCardDuel']) {
      assert.notEqual(translate(language, key), key);
    }
  }
});

test('constructs a native file payload without mutating text share data', () => {
  const shareData = { title: 'Orbit Lock', text: 'Beat 50', url: 'https://example.test/?v=1' };
  const file = { name: 'result.png' };
  const fileData = buildFileShareData(shareData, file);
  assert.deepEqual(fileData, { ...shareData, files: [file] });
  assert.equal('files' in shareData, false);
  assert.throws(() => buildFileShareData(null, file), TypeError);
});

function fakeCanvasDocument(blob = new Blob(['png'], { type: 'image/png' })) {
  const gradient = { addColorStop() {} };
  const context = new Proxy({
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, beginPath() {}, moveTo() {}, arcTo() {}, closePath() {},
    fill() {}, stroke() {}, arc() {}, fillRect() {}, fillText() {}, lineTo() {}
  }, { set(target, key, value) { target[key] = value; return true; } });
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
    toBlob(callback) { callback(blob); }
  };
  return { canvas, documentRef: { createElement: (name) => { assert.equal(name, 'canvas'); return canvas; } } };
}

class FakeFile extends Blob {
  constructor(parts, name, options = {}) {
    super(parts, options);
    this.name = name;
    this.lastModified = options.lastModified;
  }
}

test('renders a bounded PNG file and releases its canvas deterministically', async () => {
  const model = buildResultCardModel({ challengeId: 'mirror-fuse', appName: 'Arena', challengeName: 'Mirror Fuse', score: 345, labels });
  const { canvas, documentRef } = fakeCanvasDocument();
  const artifact = await renderResultCard(model, { documentRef, FileCtor: FakeFile });
  assert.equal(artifact.file.type, 'image/png');
  assert.equal(artifact.file.name, 'social-challenge-mirror-fuse-345.png');
  assert.equal(artifact.file.lastModified, 0);
  assert.equal(artifact.size, 3);
  artifact.dispose();
  artifact.dispose();
  assert.equal(canvas.width, 1);
  assert.equal(canvas.height, 1);
});

test('aborted or oversized rendering fails without producing a share file', async () => {
  const model = buildResultCardModel({ challengeId: 'orbit-lock', appName: 'Arena', challengeName: 'Orbit Lock', score: 1, labels });
  const controller = new AbortController();
  controller.abort();
  const aborted = fakeCanvasDocument();
  await assert.rejects(() => renderResultCard(model, { documentRef: aborted.documentRef, FileCtor: FakeFile, signal: controller.signal }), { name: 'AbortError' });
  const oversized = fakeCanvasDocument(new Blob([new Uint8Array(20)]));
  await assert.rejects(() => renderResultCard(model, { documentRef: oversized.documentRef, FileCtor: FakeFile, maxBytes: 10 }), RangeError);
  assert.equal(oversized.canvas.width, 1);
  assert.equal(oversized.canvas.height, 1);
});
