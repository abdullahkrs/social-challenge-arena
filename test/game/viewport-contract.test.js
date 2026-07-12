const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..', '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const styles = readFileSync(join(root, 'styles.css'), 'utf8');

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function getRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = styles.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Expected CSS rule for ${selector}.`);
  return match[1];
}

function getViewportMarkup() {
  const start = html.indexOf('<div class="arcade-viewport"');
  const end = html.indexOf('\n\n      <div class="scoreboard"', start);
  assert.notEqual(start, -1, 'Expected the arcade viewport in the challenge view.');
  assert.notEqual(end, -1, 'Expected the viewport to end before the legacy scoreboard.');
  return html.slice(start, end);
}

test('adds one hidden named viewport inside the existing challenge view', () => {
  const challengeStart = html.indexOf('<section class="view game-view" id="challenge-view"');
  const challengeEnd = html.indexOf('</section>', challengeStart);
  const viewportStart = html.indexOf('<div class="arcade-viewport"', challengeStart);

  assert.notEqual(challengeStart, -1);
  assert.ok(viewportStart > challengeStart && viewportStart < challengeEnd);
  assert.equal(countMatches(html, /id="arcade-viewport"/g), 1);
  assert.equal(countMatches(html, /id="arcade-status"/g), 1);
  assert.match(
    html,
    /<div class="arcade-viewport" id="arcade-viewport" role="region" aria-label="[^"]+" hidden>/
  );
});

test('keeps the required visual layers empty, ordered, and non-focusable', () => {
  const viewport = getViewportMarkup();
  const orderedClasses = [
    'arcade-world-layer',
    'arcade-entity-layer',
    'arcade-effects-layer',
    'arcade-hud-layer',
    'arcade-status'
  ];
  let previousIndex = -1;

  for (const className of orderedClasses) {
    const index = viewport.indexOf(className);
    assert.ok(index > previousIndex, `${className} must follow the previous viewport layer.`);
    previousIndex = index;
  }

  assert.doesNotMatch(viewport, /<(?:a|button|input|select|textarea)\b/i);
  assert.doesNotMatch(viewport, /\b(?:tabindex|contenteditable)\s*=/i);
  assert.equal(viewport.replace(/<[^>]+>/g, '').trim(), '');
  assert.equal(countMatches(viewport, /aria-hidden="true"/g), 4);
});

test('provides one empty polite status output without visible instructions', () => {
  assert.match(
    html,
    /<p class="sr-only arcade-status" id="arcade-status" aria-live="polite" aria-atomic="true"><\/p>/
  );
  assert.equal(getViewportMarkup().replace(/<[^>]+>/g, '').trim(), '');
});

test('defines a contained mobile viewport and deterministic stacking contract', () => {
  const viewportRule = getRule('.arcade-viewport');
  const layerRule = getRule('.arcade-layer');
  const hudRule = getRule('.arcade-hud-layer');

  assert.match(viewportRule, /position:\s*relative/);
  assert.match(viewportRule, /isolation:\s*isolate/);
  assert.match(viewportRule, /width:\s*100%/);
  assert.match(viewportRule, /max-width:\s*100%/);
  assert.match(viewportRule, /min-width:\s*0/);
  assert.match(viewportRule, /aspect-ratio:\s*4\s*\/\s*5/);
  assert.match(viewportRule, /min-height:\s*18rem/);
  assert.match(viewportRule, /max-height:\s*min\(75svh,\s*34rem\)/);
  assert.match(viewportRule, /overflow:\s*hidden/);
  assert.match(viewportRule, /contain:\s*layout paint style/);
  assert.match(viewportRule, /touch-action:\s*manipulation/);

  assert.match(layerRule, /position:\s*absolute/);
  assert.match(layerRule, /inset:\s*0/);
  assert.match(layerRule, /pointer-events:\s*none/);
  assert.match(layerRule, /transform:\s*translateZ\(0\)/);
  assert.match(getRule('.arcade-world-layer'), /z-index:\s*0/);
  assert.match(getRule('.arcade-entity-layer'), /z-index:\s*1/);
  assert.match(getRule('.arcade-effects-layer'), /z-index:\s*2/);
  assert.match(hudRule, /z-index:\s*3/);
  assert.match(hudRule, /min-height:\s*2\.75rem/);

  assert.match(styles, /body\s*\{[\s\S]*?min-width:\s*320px/);
  assert.match(styles, /\.shell\s*\{[\s\S]*?width:\s*min\(100%,\s*30rem\)/);
});

test('adds no viewport animation and explicitly preserves reduced-motion equivalence', () => {
  const viewportSection = styles.slice(
    styles.indexOf('.arcade-viewport'),
    styles.indexOf('.scoreboard')
  );
  const reducedMotion = styles.slice(styles.lastIndexOf('@media (prefers-reduced-motion: reduce)'));

  assert.doesNotMatch(viewportSection, /\banimation\s*:/);
  assert.doesNotMatch(viewportSection, /\btransition\s*:/);
  assert.match(reducedMotion, /\.arcade-viewport,\s*\n\s*\.arcade-layer\s*\{/);
  assert.match(reducedMotion, /transition:\s*none\s*!important/);
  assert.match(reducedMotion, /animation:\s*none\s*!important/);
});

test('preserves legacy controls while the new shell remains hidden', () => {
  for (const id of [
    'challenge-view',
    'time-value',
    'tap-count',
    'timing-board',
    'tap-button',
    'game-status',
    'back-to-challenges'
  ]) {
    assert.equal(countMatches(html, new RegExp(`id="${id}"`, 'g')), 1);
  }

  assert.match(html, /<section class="view game-view" id="challenge-view"[^>]* hidden>/);
  assert.match(html, /<div class="arcade-viewport"[^>]* hidden>/);
});

test('keeps generated index and styles synchronized with source', () => {
  assert.equal(readFileSync(join(root, 'docs', 'index.html'), 'utf8'), html);
  assert.equal(readFileSync(join(root, 'docs', 'styles.css'), 'utf8'), styles);
});
