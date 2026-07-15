import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('./worker-106-apply.mjs', import.meta.url);
let source = await readFile(path, 'utf8');
const start = source.indexOf('async function patchIntegration(path, challengeId) {');
const end = source.indexOf('\nasync function patchIntegrations()', start);
if (start < 0 || end < 0) throw new Error('patchIntegration block not found');

const replacement = `async function patchIntegration(path, challengeId) {
  let content = await read(path);
  const removeRequiredLine = (pattern, label) => {
    const next = content.replace(pattern, '');
    if (next === content) throw new Error(\`Missing integration target: \${challengeId} \${label}\`);
    content = next;
  };

  removeRequiredLine(/^\\s*const roundCell = document\\.querySelector\\('#round-value'\\)\\?\\.closest\\('div'\\);\\n/m, 'round cell');
  removeRequiredLine(/^\\s*const roundLabel = roundCell\\?\\.querySelector\\('span'\\);\\n/m, 'round label');
  removeRequiredLine(/^\\s*const roundValue = document\\.querySelector\\('#round-value'\\);\\n/m, 'round value');
  removeRequiredLine(new RegExp(\`^\\\\s*const durationValue = document\\\\.querySelector\\\\('\\\\[data-challenge-id="\${challengeId}"\\\\] \\\\[data-duration\\\\]'\\\\);\\\\n\`, 'm'), 'duration reference');

  content = content.replace(/^\\s*function updateCatalogDuration\\(\\) \\{\\n\\s*if \\(durationValue[^\\n]*\\n\\s*\\}\\n?/m, '');
  content = content.replace(/^\\s*function updateCatalogDuration\\(\\) \\{[^\\n]*\\}\\n?/m, '');
  content = content.replace(/^\\s*if \\(durationValue\\) \\{\\n\\s*new MutationObserver[^\\n]*\\n\\s*\\}\\n?/m, '');
  content = content.replace(/^\\s*if \\(durationValue\\) new MutationObserver[^\\n]*\\n?/m, '');
  content = content.replace(/^\\s*queueMicrotask\\(updateCatalogDuration\\);\\n?/m, '');
  content = content.replace(/^\\s*updateCatalogDuration\\(\\);\\n?/gm, '');
  content = content.replace(/^\\s*if \\(roundLabel\\)[^\\n]*\\n?/gm, '');
  content = content.replace(/^\\s*if \\(roundValue\\)[^\\n]*\\n?/gm, '');

  if (/durationValue|updateCatalogDuration|roundLabel|roundValue|round-value/.test(content)) {
    throw new Error(\`\${challengeId} still owns shared catalog or HUD truth\`);
  }
  await write(path, content);
}
`;

source = source.slice(0, start) + replacement + source.slice(end);
await writeFile(path, source, 'utf8');
