import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gameUrl = new URL('../src/lumen-game.mjs', import.meta.url);
const integrationUrl = new URL('../src/lumen-integration.mjs', import.meta.url);

test('switching away from Lumen clears result state before later language updates', async () => {
  const source = await readFile(integrationUrl, 'utf8');
  const resetSharedHud = source.match(/function resetSharedHud\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(resetSharedHud, /resultDetail\?\.setAttribute\('hidden', ''\)/);
  assert.match(resetSharedHud, /lastResult = null;/);
  assert.match(source, /if \(lastResult\) updateResult\(\);/);
});

test('a terminal miss cannot be reclassified as a voluntary exit', async () => {
  const source = await readFile(gameUrl, 'utf8');
  const terminalMiss = source.match(/if \(this\.snapshot\.lives <= 0\) \{([\s\S]*?)\n    \}/)?.[1] ?? '';
  const requestExit = source.match(/requestExit\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? '';

  assert.match(terminalMiss, /this\.terminalPending = true;/);
  assert.match(terminalMiss, /this\.exitArmed = false;/);
  assert.match(terminalMiss, /this\.exitButton\.disabled = true;/);
  assert.match(terminalMiss, /this\.schedule\(\(\) => this\.finish\('failed'\), 440\)/);
  assert.match(requestExit, /if \(!this\.running \|\| this\.terminalPending\) return;/);
  assert.match(source, /this\.terminalPending = false;/);
});

test('memory stages use one ordered announcement path and start the unchanged deadline only after Ready', async () => {
  const [gameSource, integrationSource] = await Promise.all([
    readFile(gameUrl, 'utf8'),
    readFile(integrationUrl, 'utf8')
  ]);
  const memoryPlayback = gameSource.match(/playMemorySequence\(stage\) \{([\s\S]*?)\n  \}\n\n  presentMemoryDecision/)?.[1] ?? '';
  const responseStart = gameSource.match(/startMemoryResponse\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? '';

  assert.doesNotMatch(memoryPlayback, /this\.onAnnounce/);
  assert.match(gameSource, /data-lumen-memory-repeat/);
  assert.match(gameSource, /data-lumen-memory-ready/);
  assert.match(gameSource, /this\.emit\('memory-ready', \{ stage \}\)/);
  assert.match(gameSource, /replayMemorySequence\(\)/);
  assert.match(responseStart, /this\.roundStartedAt = performance\.now\(\);/);
  assert.match(responseStart, /this\.deadlineTimer = this\.schedule\(\(\) => this\.resolveMiss\('slow'\), stage\.deadlineMs\)/);
  assert.match(integrationSource, /memoryAnnouncement = 'sequence'/);
  assert.match(integrationSource, /stage\.sequence\.map\(laneName\)\.join\(', '\)/);
  assert.match(integrationSource, /memoryAnnouncement = 'choose'/);
});
