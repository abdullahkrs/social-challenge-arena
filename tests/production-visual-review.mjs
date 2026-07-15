import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.PRODUCTION_URL || 'https://abdullahkrs.github.io/social-challenge-arena';
const reviewSha = process.env.REVIEW_SHA || 'manual';
const evidenceDir = 'production-review';
const changed = (await readFile(`${evidenceDir}/changed-files.txt`, 'utf8'))
  .split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
const fullReview = process.env.FULL_REVIEW === 'true' || changed.includes('FULL_REVIEW');

await mkdir(`${evidenceDir}/screenshots`, { recursive: true });

function impactPlan(files) {
  if (fullReview) return { skip: false, deepAll: true, locales: true, reasons: ['manual full review'] };
  if (files.length === 0) return { skip: false, deepAll: true, locales: true, reasons: ['unknown empty diff'] };

  const docsOnly = files.every((file) => /^(README|CHANGELOG|ROADMAP|TASK_LOG|DECISIONS|BACKLOG|EXPERIMENTS|METRICS|AGENT|SWARM|.*\.md$)/.test(file));
  const testOnly = files.every((file) => /^(tests\/|\.github\/)/.test(file));
  if (docsOnly || testOnly) return { skip: true, deepAll: false, locales: false, reasons: [docsOnly ? 'docs-only' : 'tests/workflow-only'] };

  const shared = files.some((file) => /^(index\.html|styles\.css|ui.*\.css|mirror\.css|src\/app\.mjs|src\/audio|src\/i18n|src\/share|scripts\/build)/.test(file));
  const locales = files.some((file) => /i18n|copy|local/i.test(file));
  const ids = new Set();
  for (const file of files) {
    if (/orbit/i.test(file)) ids.add('orbit-lock');
    if (/echo/i.test(file)) ids.add('echo-grid');
    if (/lumen/i.test(file)) ids.add('lumen-lanes');
    if (/mirror/i.test(file)) ids.add('mirror-fuse');
  }
  return {
    skip: false,
    deepAll: shared || ids.size === 0,
    deepIds: [...ids],
    locales: locales || shared,
    reasons: shared ? ['shared surface changed'] : ids.size ? ['challenge-local change'] : ['unknown impact; broad safe review']
  };
}

const plan = impactPlan(changed);
const report = {
  reviewedAt: new Date().toISOString(),
  reviewSha,
  baseUrl,
  changedFiles: changed,
  plan,
  discoveredChallenges: [],
  smoke: [],
  deep: [],
  errors: []
};

await writeFile(`${evidenceDir}/impact-plan.json`, JSON.stringify(plan, null, 2));

if (plan.skip) {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  console.log(`Visual review skipped: ${plan.reasons.join(', ')}`);
  process.exit(0);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'en-US',
  recordVideo: { dir: `${evidenceDir}/video`, size: { width: 390, height: 844 } }
});
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
const page = await context.newPage();

page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push({ type: 'console', text: message.text() });
});
page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', text: error.message }));
page.on('requestfailed', (request) => report.errors.push({ type: 'requestfailed', text: `${request.method()} ${request.url()} ${request.failure()?.errorText || ''}` }));

async function loadHome(locale = 'en') {
  await page.goto(`${baseUrl}/?production-review=${encodeURIComponent(reviewSha)}`, { waitUntil: 'networkidle' });
  await page.locator('#app').waitFor({ state: 'visible' });
  const select = page.locator('#language-select');
  if (await select.count()) {
    await select.selectOption(locale);
    await page.waitForTimeout(150);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`Horizontal overflow on discovery: ${overflow}px`);
}

async function discoverChallenges() {
  await loadHome('en');
  return page.locator('[data-challenge-id]').evaluateAll((cards) => cards.map((card) => ({
    id: card.getAttribute('data-challenge-id'),
    label: (card.textContent || '').replace(/\s+/g, ' ').trim()
  })).filter((item) => item.id));
}

async function safeInteraction(id) {
  if (id === 'orbit-lock') {
    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  } else if (id === 'echo-grid') {
    await page.locator('#echo-grid button:not([disabled])').first().click({ timeout: 3000 }).catch(() => {});
  } else if (id === 'lumen-lanes') {
    await page.locator('[data-lane="1"]').click({ timeout: 3000 }).catch(() => {});
  } else if (id === 'mirror-fuse') {
    await page.locator('[data-mirror-option="0"]').click({ timeout: 3000 }).catch(() => {});
  }
}

async function openChallenge(id, deep = false, locale = 'en') {
  await loadHome(locale);
  const card = page.locator(`[data-challenge-id="${id}"]`);
  await card.waitFor({ state: 'visible' });
  await card.click();
  await page.locator('[data-screen="instructions"]').waitFor({ state: 'visible' });
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-instructions.png`, fullPage: true });
  await page.locator('#start-button').click();
  await page.locator('[data-screen="game"]').waitFor({ state: 'visible' });
  await safeInteraction(id);
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`Horizontal overflow in ${id}/${locale}: ${overflow}px`);
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-game.png`, fullPage: true });
}

try {
  const challenges = await discoverChallenges();
  if (challenges.length === 0) throw new Error('No production challenges discovered');
  report.discoveredChallenges = challenges;
  await page.screenshot({ path: `${evidenceDir}/screenshots/discovery-en.png`, fullPage: true });

  for (const challenge of challenges) {
    const started = Date.now();
    try {
      await openChallenge(challenge.id, false, 'en');
      report.smoke.push({ id: challenge.id, status: 'pass', durationMs: Date.now() - started });
    } catch (error) {
      report.smoke.push({ id: challenge.id, status: 'fail', error: error.message });
      report.errors.push({ type: 'smoke', challenge: challenge.id, text: error.message });
    }
  }

  const failedSmokeIds = report.smoke.filter((item) => item.status === 'fail').map((item) => item.id);
  const deepIds = plan.deepAll
    ? challenges.map((challenge) => challenge.id)
    : [...new Set([...(plan.deepIds || []), ...failedSmokeIds])];
  const locales = plan.locales ? ['ar', 'en', 'tr'] : ['en'];

  for (const id of deepIds) {
    for (const locale of locales) {
      const started = Date.now();
      try {
        await openChallenge(id, true, locale);
        report.deep.push({ id, locale, status: 'pass', durationMs: Date.now() - started });
      } catch (error) {
        report.deep.push({ id, locale, status: 'fail', error: error.message });
        report.errors.push({ type: 'deep', challenge: id, locale, text: error.message });
      }
    }
  }

  if (plan.locales) {
    for (const locale of ['ar', 'tr']) {
      await loadHome(locale);
      await page.screenshot({ path: `${evidenceDir}/screenshots/discovery-${locale}.png`, fullPage: true });
    }
  }
} finally {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  await context.tracing.stop({ path: `${evidenceDir}/trace.zip` });
  await context.close();
  await browser.close();
}

const failures = [...report.smoke, ...report.deep].filter((item) => item.status === 'fail');
if (failures.length || report.errors.length) {
  console.error(JSON.stringify({ failures, errors: report.errors }, null, 2));
  process.exit(1);
}

console.log(`Production visual review passed: ${report.smoke.length} smoke checks, ${report.deep.length} deep checks.`);
