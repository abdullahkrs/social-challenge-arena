import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.PRODUCTION_URL || 'https://abdullahkrs.github.io/social-challenge-arena';
const reviewSha = process.env.REVIEW_SHA || 'manual';
const evidenceDir = 'production-review';
const changed = (await readFile(`${evidenceDir}/changed-files.txt`, 'utf8')).split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
const fullReview = process.env.FULL_REVIEW === 'true' || changed.includes('FULL_REVIEW');
await mkdir(`${evidenceDir}/screenshots`, { recursive: true });

function impactPlan(files) {
  const infrastructure = files.some((file) => file === '.github/workflows/production-visual-review.yml' || file === 'tests/production-visual-review.mjs');
  const docsOnly = files.length > 0 && files.every((file) => /^(README|CHANGELOG|ROADMAP|TASK_LOG|DECISIONS|BACKLOG|EXPERIMENTS|METRICS|AGENT|SWARM|.*\.md$)/.test(file));
  if (!fullReview && docsOnly) return { skip: true, deepAll: false, locales: false, reasons: ['docs-only'] };
  return { skip: false, deepAll: true, locales: true, reasons: [fullReview ? 'manual full review' : infrastructure ? 'review infrastructure changed' : 'Rift Relay surface changed'] };
}

const plan = impactPlan(changed);
const report = { reviewedAt: new Date().toISOString(), reviewSha, baseUrl, changedFiles: changed, plan, discoveredChallenges: [], smoke: [], deep: [], errors: [] };
await writeFile(`${evidenceDir}/impact-plan.json`, JSON.stringify(plan, null, 2));
if (plan.skip) {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  process.exit(0);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', recordVideo: { dir: `${evidenceDir}/video`, size: { width: 390, height: 844 } } });
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
const page = await context.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.errors.push({ type: 'console', text: message.text() }); });
page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', text: error.message }));
page.on('requestfailed', (request) => report.errors.push({ type: 'requestfailed', text: `${request.method()} ${request.url()} ${request.failure()?.errorText || ''}` }));

async function loadHome(locale = 'en') {
  await page.goto(`${baseUrl}/?production-review=${encodeURIComponent(reviewSha)}`, { waitUntil: 'networkidle' });
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.locator('#language-select').selectOption(locale);
  await page.waitForTimeout(100);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`Horizontal overflow: ${overflow}px`);
}

async function discoverChallenges() {
  await loadHome('en');
  return page.locator('[data-challenge-id]').evaluateAll((cards) => cards.map((card) => ({ id: card.getAttribute('data-challenge-id'), label: (card.textContent || '').replace(/\s+/g, ' ').trim() })).filter((item) => item.id));
}

async function openChallenge(id, locale, deep) {
  await loadHome(locale);
  await page.locator(`[data-challenge-id="${id}"] #open-button`).click();
  await page.locator('[data-screen="instructions"]').waitFor({ state: 'visible' });
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-instructions.png`, fullPage: true });
  await page.locator('#start-button').click();
  await page.locator('[data-screen="game"]').waitFor({ state: 'visible' });
  await page.locator('[data-rift-lane="1"]').click();
  await page.locator('[data-rift-jump]').click();
  await page.waitForTimeout(300);
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-game.png`, fullPage: true });
}

try {
  const challenges = await discoverChallenges();
  if (challenges.length !== 1 || challenges[0].id !== 'rift-relay') throw new Error(`Expected only Rift Relay; found ${JSON.stringify(challenges)}`);
  report.discoveredChallenges = challenges;
  await page.screenshot({ path: `${evidenceDir}/screenshots/discovery-en.png`, fullPage: true });
  try { await openChallenge('rift-relay', 'en', false); report.smoke.push({ id: 'rift-relay', status: 'pass' }); }
  catch (error) { report.smoke.push({ id: 'rift-relay', status: 'fail', error: error.message }); report.errors.push({ type: 'smoke', challenge: 'rift-relay', text: error.message }); }
  for (const locale of ['ar', 'en', 'tr']) {
    try { await openChallenge('rift-relay', locale, true); report.deep.push({ id: 'rift-relay', locale, status: 'pass' }); }
    catch (error) { report.deep.push({ id: 'rift-relay', locale, status: 'fail', error: error.message }); report.errors.push({ type: 'deep', challenge: 'rift-relay', locale, text: error.message }); }
  }
} finally {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  await context.tracing.stop({ path: `${evidenceDir}/trace.zip` });
  await context.close();
  await browser.close();
}
if ([...report.smoke, ...report.deep].some((item) => item.status === 'fail') || report.errors.length) process.exit(1);
console.log('Production visual review passed for Rift Relay in ar, en, and tr.');