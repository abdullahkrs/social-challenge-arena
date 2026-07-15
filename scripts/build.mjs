import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const files = [
  'index.html',
  'rift.css',
  'THIRD_PARTY_NOTICES.md',
  'src/app.mjs',
  'src/rift-game.mjs',
  'src/rift-relay-model.mjs'
];

await rm(dist, { recursive: true, force: true });
for (const file of files) {
  const target = join(dist, file);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, file), target);
}

const html = await readFile(join(dist, 'index.html'), 'utf8');
for (const required of ['./rift.css', './src/app.mjs', 'data-challenge-id="rift-relay"']) {
  if (!html.includes(required)) throw new Error(`Missing Rift Relay production reference: ${required}`);
}

for (const requiredModule of ['src/app.mjs', 'src/rift-game.mjs', 'src/rift-relay-model.mjs']) {
  await stat(join(dist, requiredModule));
}

const forbidden = ['orbit-lock', 'echo-grid', 'lumen-lanes', 'mirror-fuse'];
for (const file of ['index.html', 'src/app.mjs', 'src/rift-game.mjs', 'src/rift-relay-model.mjs']) {
  const content = await readFile(join(dist, file), 'utf8');
  for (const legacy of forbidden) {
    if (content.includes(legacy)) throw new Error(`Legacy challenge reference ${legacy} remains in ${file}`);
  }
}

const budgetBytes = 180 * 1024;
let total = 0;
for (const file of files) total += (await stat(join(root, file))).size;
if (total > budgetBytes) throw new Error(`Static bundle exceeds ${budgetBytes} bytes: ${total}`);
console.log(`Built Rift Relay dist/ (${total} bytes, budget ${budgetBytes} bytes)`);