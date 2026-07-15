import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const status = JSON.parse(await readFile(join(root, 'CATALOG_RESET_STATUS.json'), 'utf8'));
const forbidden = ['orbit-lock', 'echo-grid', 'lumen-lanes', 'mirror-fuse'];
const shippedEntries = [
  'index.html',
  'rift.css',
  'src/app.mjs',
  'src/catalog.mjs',
  'src/core.mjs',
  'src/rift-game.mjs',
  'src/rift-relay-model.mjs',
  '.github/workflows/production-visual-review.yml'
];

async function collectFiles(path) {
  let info;
  try { info = await stat(path); } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
  if (info.isFile()) return [path];
  const files = [];
  for (const entry of await readdir(path)) files.push(...await collectFiles(join(path, entry)));
  return files;
}

test('catalog reset is explicitly complete and still tied to Issue #114', () => {
  assert.equal(status.activeIssue, 114);
  assert.equal(status.replacementChallenge, 'rift-relay');
  assert.equal(status.legacyAllowed, false);
  assert.equal(status.agentsPaused, true);
});

test('shipped application and production review contain no legacy challenge paths', async () => {
  const violations = [];
  for (const entry of shippedEntries) {
    for (const file of await collectFiles(join(root, entry))) {
      const rel = relative(root, file).replaceAll('\\', '/');
      const content = (await readFile(file, 'utf8')).toLowerCase();
      for (const id of forbidden) {
        const patterns = [id, id.replaceAll('-', '_'), id.replaceAll('-', ''), id.split('-').join(' ')];
        if (patterns.some((pattern) => rel.toLowerCase().includes(pattern) || content.includes(pattern))) {
          violations.push(`${rel}: ${id}`);
        }
      }
    }
  }
  assert.deepEqual(violations, [], `Legacy shipped references remain:\n${violations.join('\n')}`);
});

test('the discovery shell ships exactly one Rift Relay entry', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/data-challenge-id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, ['rift-relay']);
});
