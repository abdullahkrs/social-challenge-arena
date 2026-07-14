import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserCandidates = [
  process.env.CHROME_BIN,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser'
].filter(Boolean);

function findChromium() {
  return browserCandidates.find((candidate) => spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) ?? null;
}

function browserPage() {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Share card browser check</title></head>
<body><pre id="result">running</pre>
<script type="module">
import {
  SHARE_CARD_HEIGHT, SHARE_CARD_MAX_BYTES, SHARE_CARD_WIDTH,
  buildResultCardModel, renderResultCard
} from '/src/share-card.mjs';
import { CHALLENGE_IDS } from '/src/core.mjs';
import { messages, supportedLanguages } from '/src/i18n.mjs';

const challengeNameKeys = {
  'orbit-lock': 'orbitName',
  'echo-grid': 'echoName',
  'lumen-lanes': 'lumenName',
  'mirror-fuse': 'mirrorName'
};
const variants = [
  { name: 'solo', score: 9999, challengerScore: null, outcomeKey: null },
  { name: 'win', score: 9999, challengerScore: 0, outcomeKey: 'win' },
  { name: 'loss', score: 0, challengerScore: 9999, outcomeKey: 'lose' },
  { name: 'tie', score: 9999, challengerScore: 9999, outcomeKey: 'tie' }
];

function format(template, values = {}) {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll('{' + key + '}', String(value)),
    template
  );
}

try {
  await document.fonts.ready;
  let largest = { bytes: 0, challengeId: '', language: '', variant: '' };
  let cases = 0;
  for (const language of supportedLanguages) {
    const copy = messages[language];
    for (const challengeId of CHALLENGE_IDS) {
      for (const variant of variants) {
        const difference = Math.abs(variant.score - (variant.challengerScore ?? variant.score));
        const model = buildResultCardModel({
          challengeId,
          language,
          direction: language === 'ar' ? 'rtl' : 'ltr',
          appName: copy.appName,
          challengeName: copy[challengeNameKeys[challengeId]],
          score: variant.score,
          challengerScore: variant.challengerScore,
          labels: {
            score: copy.score,
            challenger: copy.challenger,
            you: copy.you,
            duel: copy.shareCardDuel,
            outcome: variant.outcomeKey ? format(copy[variant.outcomeKey], { difference }) : '',
            callToAction: copy.shareCardCallToAction,
            privacy: copy.privacy
          }
        });
        const artifact = await renderResultCard(model);
        if (artifact.size > largest.bytes) {
          largest = { bytes: artifact.size, challengeId, language, variant: variant.name };
        }
        if (artifact.file.type !== 'image/png') throw new Error('Unexpected file type');
        artifact.dispose();
        cases += 1;
      }
    }
  }
  document.querySelector('#result').textContent = JSON.stringify({
    ok: true,
    cases,
    largest,
    maxBytes: SHARE_CARD_MAX_BYTES,
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT
  });
} catch (error) {
  document.querySelector('#result').textContent = JSON.stringify({
    ok: false,
    error: error?.stack || error?.message || String(error)
  });
}
</script></body></html>`;
}

function contentType(pathname) {
  if (pathname.endsWith('.mjs') || pathname.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (pathname.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      if (pathname === '/__share-card-browser-check__.html') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        response.end(browserPage());
        return;
      }
      const absolutePath = resolve(repositoryRoot, '.' + pathname);
      if (absolutePath !== repositoryRoot && !absolutePath.startsWith(repositoryRoot + sep)) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(absolutePath);
      response.writeHead(200, { 'content-type': contentType(extname(absolutePath) ? absolutePath : pathname), 'cache-control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return server;
}

function runChromium(binary, url) {
  const argumentsList = [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking',
    '--disable-default-apps', '--disable-extensions', '--disable-sync', '--metrics-recording-only',
    '--no-first-run', '--mute-audio', '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=60000', '--dump-dom', url
  ];
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(binary, argumentsList, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      rejectRun(new Error('Chromium share-card check timed out'));
    }, 90000);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', (error) => {
      clearTimeout(timeout);
      rejectRun(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) rejectRun(new Error(`Chromium exited ${code}: ${stderr.slice(-2000)}`));
      else resolveRun(stdout);
    });
  });
}

function decodeHtmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

test('real Chromium keeps every localized solo and duel PNG inside the share bound', { timeout: 120000 }, async (context) => {
  const chromium = findChromium();
  if (!chromium) {
    if (process.env.CI) assert.fail('Chromium is required for real-browser share-card coverage in CI');
    context.skip('Chromium is not installed');
    return;
  }

  const server = await startServer();
  try {
    const address = server.address();
    const output = await runChromium(chromium, `http://127.0.0.1:${address.port}/__share-card-browser-check__.html`);
    const match = output.match(/<pre id="result">([\s\S]*?)<\/pre>/);
    assert.ok(match, 'Chromium did not return the share-card result payload');
    const result = JSON.parse(decodeHtmlText(match[1]));
    assert.equal(result.ok, true, result.error);
    assert.equal(result.cases, 48);
    assert.equal(result.width, 720);
    assert.equal(result.height, 900);
    assert.ok(result.largest.bytes > 0);
    assert.ok(result.largest.bytes <= result.maxBytes, JSON.stringify(result.largest));
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
});
