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
  return { skip: false, deepAll: true, locales: true, reasons: [fullReview ? 'manual full review' : infrastructure ? 'review infrastructure changed' : 'Rift Relay touch surface changed'] };
}

const plan = impactPlan(changed);
const report = { reviewedAt: new Date().toISOString(), reviewSha, baseUrl, changedFiles: changed, plan, discoveredChallenges: [], smoke: [], deep: [], errors: [] };
await writeFile(`${evidenceDir}/impact-plan.json`, JSON.stringify(plan, null, 2));
if (plan.skip) {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  process.exit(0);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'en-US', hasTouch: true, isMobile: true, recordVideo: { dir: `${evidenceDir}/video`, size: { width: 390, height: 844 } } });
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
const page = await context.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.errors.push({ type: 'console', text: message.text() }); });
page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', text: error.message }));
page.on('requestfailed', (request) => report.errors.push({ type: 'requestfailed', text: `${request.method()} ${request.url()} ${request.failure()?.errorText || ''}` }));

async function assertMobileFit(label) {
  const fit = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gameBottom: document.querySelector('[data-screen="game"]')?.getBoundingClientRect().bottom ?? 0,
    viewport: window.innerHeight
  }));
  if (fit.horizontal > 1) throw new Error(`${label}: horizontal overflow ${fit.horizontal}px`);
  if (fit.gameBottom > fit.viewport + 1) throw new Error(`${label}: game extends ${Math.round(fit.gameBottom - fit.viewport)}px below viewport`);
}

async function loadHome(locale = 'en', viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/?production-review=${encodeURIComponent(reviewSha)}`, { waitUntil: 'networkidle' });
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.locator('#language-select').selectOption(locale);
  await page.waitForTimeout(100);
  await assertMobileFit(`home ${locale} ${viewport.width}x${viewport.height}`);
}

async function discoverChallenges() {
  await loadHome('en');
  return page.locator('[data-challenge-id]').evaluateAll((cards) => cards.map((card) => ({ id: card.getAttribute('data-challenge-id'), label: (card.textContent || '').replace(/\s+/g, ' ').trim() })).filter((item) => item.id));
}

async function useTouchGestures() {
  const arena = page.locator('#rift-arena');
  const box = await arena.boundingBox();
  if (!box) throw new Error('Rift arena has no touch box');
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height * .62;
  await page.touchscreen.tap(centerX, centerY);
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + Math.min(90, box.width * .24), centerY, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(180);
}

async function openChallenge(id, locale, deep, viewport = { width: 390, height: 844 }) {
  await loadHome(locale, viewport);
  await page.locator(`[data-challenge-id="${id}"] #open-button`).click();
  await page.locator('[data-screen="instructions"]').waitFor({ state: 'visible' });
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-${viewport.width}x${viewport.height}-instructions.png`, fullPage: true });
  await page.locator('#start-button').click();
  await page.locator('[data-screen="game"]').waitFor({ state: 'visible' });
  await assertMobileFit(`game ${locale} ${viewport.width}x${viewport.height}`);
  if (await page.locator('.rift-controls:visible').count()) throw new Error('Legacy visible gameplay buttons remain');
  await useTouchGestures();
  if (deep) await page.screenshot({ path: `${evidenceDir}/screenshots/${id}-${locale}-${viewport.width}x${viewport.height}-game.png`, fullPage: true });
}

try {
  const challenges = await discoverChallenges();
  if (challenges.length !== 1 || challenges[0].id !== 'rift-relay') throw new Error(`Expected only Rift Relay; found ${JSON.stringify(challenges)}`);
  report.discoveredChallenges = challenges;
  await page.screenshot({ path: `${evidenceDir}/screenshots/discovery-en.png`, fullPage: true });
  try { await openChallenge('rift-relay', 'en', false); report.smoke.push({ id: 'rift-relay', status: 'pass' }); }
  catch (error) { report.smoke.push({ id: 'rift-relay', status: 'fail', error: error.message }); report.errors.push({ type: 'smoke', challenge: 'rift-relay', text: error.message }); }
  for (const locale of ['ar', 'en', 'tr']) {
    for (const viewport of [{ width: 360, height: 640 }, { width: 390, height: 844 }]) {
      try { await openChallenge('rift-relay', locale, true, viewport); report.deep.push({ id: 'rift-relay', locale, viewport, status: 'pass' }); }
      catch (error) { report.deep.push({ id: 'rift-relay', locale, viewport, status: 'fail', error: error.message }); report.errors.push({ type: 'deep', challenge: 'rift-relay', locale, viewport, text: error.message }); }
    }
  }
} finally {
  await writeFile(`${evidenceDir}/report.json`, JSON.stringify(report, null, 2));
  await context.tracing.stop({ path: `${evidenceDir}/trace.zip` });
  await context.close();
  await browser.close();
}
if ([...report.smoke, ...report.deep].some((item) => item.status === 'fail') || report.errors.length) process.exit(1);
console.log('Production visual review passed for touch-first Rift Relay on compact and standard phones in ar, en, and tr.');