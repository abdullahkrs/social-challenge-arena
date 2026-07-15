import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const statusPath = join(root, 'CATALOG_RESET_STATUS.json');
const status = JSON.parse(await readFile(statusPath, 'utf8'));

const scanEntries = [
  'index.html',
  'styles.css',
  'ui.css',
  'ui-accessibility.css',
  'mirror.css',
  'src',
  'scripts',
  '.github/workflows',
  'tests'
];

const excludedPaths = new Set([
  'tests/catalog-reset-contract.test.mjs'
]);

async function collectFiles(path) {
  let info;
  try {
    info = await stat(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
  if (info.isFile()) return [path];
  const files = [];
  for (const entry of await readdir(path)) {
    files.push(...await collectFiles(join(path, entry)));
  }
  return files;
}

test('catalog reset status remains explicitly tied to Issue #114', () => {
  assert.equal(status.activeIssue, 114);
  assert.deepEqual(status.legacyChallengeIds, [
    'orbit-lock',
    'echo-grid',
    'lumen-lanes',
    'mirror-fuse'
  ]);
  assert.equal(typeof status.legacyAllowed, 'boolean');
});

test('completed catalog reset contains no shipped legacy challenge references', async (t) => {
  if (status.legacyAllowed) {
    t.skip('Issue #114 is still executing; set legacyAllowed=false only in the completed reset PR.');
    return;
  }

  const violations = [];
  for (const entry of scanEntries) {
    for (const file of await collectFiles(join(root, entry))) {
      const rel = relative(root, file).replaceAll('\\', '/');
      if (excludedPaths.has(rel)) continue;
      const lowerPath = rel.toLowerCase();
      for (const id of status.legacyChallengeIds) {
        const fragments = [id, id.replaceAll('-', ''), id.replaceAll('-', '_')];
        if (fragments.some((fragment) => lowerPath.includes(fragment))) {
          violations.push(`${rel}: legacy filename/path ${id}`);
        }
      }

      if (!/\.(?:html|css|js|mjs|cjs|json|yml|yaml|md)$/i.test(rel)) continue;
      const content = (await readFile(file, 'utf8')).toLowerCase();
      for (const id of status.legacyChallengeIds) {
        const name = id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
        const patterns = [id, id.replaceAll('-', '_'), id.replaceAll('-', ''), name.toLowerCase()];
        if (patterns.some((pattern) => content.includes(pattern))) {
          violations.push(`${rel}: legacy content reference ${id}`);
        }
      }
    }
  }

  assert.deepEqual(violations, [], `Legacy challenge references remain:\n${violations.join('\n')}`);
});
