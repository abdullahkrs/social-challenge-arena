import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('./worker-106-apply.mjs', import.meta.url);
let source = await readFile(path, 'utf8');
const start = source.indexOf('async function patchIntegration(path, challengeId) {');
const end = source.indexOf('\nasync function patchIntegrations()', start);
if (start < 0 || end < 0) throw new Error('patchIntegration block not found');

const replacement = `async function patchIntegration(path, challengeId) {
  let content = await read(path);
  const required = [
    ['round cell', /const roundCell = document\\.querySelector\\('#round-value'\\)/],
    ['round label', /const roundLabel = roundCell/],
    ['round value', /const roundValue = document\\.querySelector\\('#round-value'\\)/],
    ['duration reference', new RegExp(\`const durationValue = document\\\\.querySelector.*data-challenge-id="\${challengeId}"\`)]
  ];
  for (const [label, pattern] of required) {
    if (!pattern.test(content)) throw new Error(\`Missing integration target: \${challengeId} \${label}\`);
  }

  const lines = content.split('\\n');
  const kept = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed.startsWith('function updateCatalogDuration() {')) {
      while (index + 1 < lines.length && lines[index + 1].trim() !== '}') index += 1;
      if (index + 1 < lines.length) index += 1;
      continue;
    }
    if (trimmed === 'if (durationValue) {') {
      while (index + 1 < lines.length && lines[index + 1].trim() !== '}') index += 1;
      if (index + 1 < lines.length) index += 1;
      continue;
    }
    if (/roundCell|roundLabel|roundValue|round-value|durationValue|updateCatalogDuration/.test(line)) continue;
    kept.push(line);
  }
  content = kept.join('\\n');

  const leftovers = content.split('\\n').filter((line) => /roundCell|roundLabel|roundValue|round-value|durationValue|updateCatalogDuration/.test(line));
  if (leftovers.length) throw new Error(\`\${challengeId} still owns shared catalog or HUD truth: \${leftovers.join(' | ')}\`);
  await write(path, content);
}
`;

source = source.slice(0, start) + replacement + source.slice(end);
await writeFile(path, source, 'utf8');
