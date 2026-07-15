import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('Orbit is integrated as an endless accessible platform journey', async () => {
  const [html, app, catalog, game, integration, copy, css, build] = await Promise.all([
    read('index.html'), read('src/app.mjs'), read('src/catalog.mjs'), read('src/game.mjs'), read('src/orbit-integration.mjs'),
    read('src/orbit-copy.mjs'), read('src/orbit.css'), read('scripts/build.mjs')
  ]);
  assert.match(html, /id="game-canvas"/);
  assert.match(integration, /ensureOrbitShell/);
  assert.match(integration, /data-orbit-ring=\"0\"[\s\S]*data-orbit-lock[\s\S]*data-orbit-ring=\"1\"/);
  assert.match(integration, /data-orbit-scan/);
  assert.match(integration, /data-orbit-exit/);
  assert.match(integration, /orbit\.css/);
  assert.match(app, /new OrbitLockGame\(\{ canvas: elements\.canvas/);
  assert.match(catalog, /id: ORBIT_LOCK_ID[\s\S]*endless: true/);
  assert.match(game, /this\.ringButtons = \[\.\.\.this\.container\.querySelectorAll/);
  assert.match(game, /terminalPending/);
  assert.match(game, /reason === 'ended' && this\.terminalPending/);
  assert.match(game, /platformAudio\.play\('(move|correct|wrong|zone|finish)'/);
  assert.match(game, /ArrowUp/);
  assert.match(game, /requestExit\(\)/);
  assert.match(copy, /Object\.assign\(messages\.ar/);
  assert.match(copy, /Object\.assign\(messages\.tr/);
  assert.match(css, /min-height: 48px/);
  assert.match(build, /orbit-model\.mjs/);
  assert.doesNotMatch([html, app, catalog, game, integration, copy, css].join('\n'), /https?:\/\//);
});

test('Orbit keyboard shortcuts stay inside the game shell', async () => {
  const game = await read('src/game.mjs');
  const guard = 'if (!this.isShortcutTarget(event.target)) return;';
  const ringLookup = 'const ring = KEY_RING[event.code];';
  assert.match(game, /target instanceof Element && this\.container\.contains\(target\)/);
  assert.ok(game.indexOf(guard) >= 0, 'shortcut target guard is required');
  assert.ok(game.indexOf(guard) < game.indexOf(ringLookup), 'shortcut target guard must run before ring shortcuts');
});
