import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const files = ['index.html', 'styles.css', 'ui.css', 'ui-accessibility.css', 'mirror.css', 'THIRD_PARTY_NOTICES.md', 'src'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of files) {
  await cp(join(root, file), join(dist, file), { recursive: true });
}

const html = await readFile(join(dist, 'index.html'), 'utf8');
for (const required of ['./styles.css', './ui.css', './ui-accessibility.css', './mirror.css', './src/app.mjs']) {
  if (!html.includes(required)) throw new Error(`Missing runtime reference: ${required}`);
}

const budgetBytes = 180 * 1024;
async function sizeOf(path) {
  const info = await stat(path);
  if (info.isFile()) return info.size;
  const entries = await readdir(path);
  let sum = 0;
  for (const entry of entries) sum += await sizeOf(join(path, entry));
  return sum;
}

let total = 0;
for (const file of files) total += await sizeOf(join(dist, file));
if (total > budgetBytes) throw new Error(`Static bundle exceeds ${budgetBytes} bytes: ${total}`);
console.log(`Built dist/ (${total} bytes, budget ${budgetBytes} bytes)`);
