import { readFile, writeFile, unlink } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

async function write(path, content) {
  await writeFile(new URL(path, root), content, 'utf8');
}

function replaceOnce(content, before, after, label) {
  const index = content.indexOf(before);
  if (index < 0) throw new Error(`Missing replacement target: ${label}`);
  if (content.indexOf(before, index + before.length) >= 0) throw new Error(`Ambiguous replacement target: ${label}`);
  return `${content.slice(0, index)}${after}${content.slice(index + before.length)}`;
}

function removeExact(content, fragment, label) {
  if (!content.includes(fragment)) throw new Error(`Missing removal target: ${label}`);
  return content.replace(fragment, '');
}

async function patchIndex() {
  let content = await read('index.html');
  content = replaceOnce(content,
    '<meta name="description" content="Fast multilingual social skill challenges.">',
    '<meta name="description" content="Endless multilingual social skill challenges.">',
    'endless meta description');
  content = replaceOnce(content,
    '<div><span data-i18n="round">Round</span><strong id="round-value">1/12</strong></div>',
    '<div><span id="progress-label">Progress</span><strong id="progress-value">1</strong></div>',
    'truthful shared progress HUD');
  await write('index.html', content);
}

async function patchCatalog() {
  let content = await read('src/catalog.mjs');
  const progressKeys = ['orbitGateLabel', 'echoTrail', 'lumenDistance', 'mirrorPattern'];
  for (const progressLabelKey of progressKeys) {
    content = replaceOnce(content,
      '    durationSeconds: 0,\n    endless: true,',
      `    statusKey: 'endless',\n    progressLabelKey: '${progressLabelKey}',\n    endless: true,`,
      `registry metadata for ${progressLabelKey}`);
  }
  await write('src/catalog.mjs', content);
}

async function patchApp() {
  let content = await read('src/app.mjs');
  content = replaceOnce(content,
    '  daily: null, activeDaily: null, dailyBest: null, dailyStorageAvailable: true\n',
    '  daily: null, activeDaily: null, dailyBest: null, dailyStorageAvailable: true, progressSnapshot: null\n',
    'central progress state');
  content = replaceOnce(content,
    "  score: document.querySelector('#score-value'), round: document.querySelector('#round-value'), lives: document.querySelector('#lives-value'), combo: document.querySelector('#combo-value'),",
    "  score: document.querySelector('#score-value'), progressLabel: document.querySelector('#progress-label'), progress: document.querySelector('#progress-value'), lives: document.querySelector('#lives-value'), combo: document.querySelector('#combo-value'),",
    'central progress elements');
  content = replaceOnce(content,
    "function challengeName() { const challenge = currentChallenge(); return challenge ? t(challenge.nameKey) : ''; }\nfunction announce(message)",
    "function challengeName() { const challenge = currentChallenge(); return challenge ? t(challenge.nameKey) : ''; }\nfunction renderProgress(snapshot = state.progressSnapshot) {\n  const challenge = currentChallenge();\n  if (!challenge) return;\n  const completed = Math.max(0, Math.trunc(Number(snapshot?.round) || 0));\n  elements.progressLabel.textContent = t(challenge.progressLabelKey);\n  elements.progress.textContent = String(completed + 1);\n}\nfunction announce(message)",
    'normalized challenge progress renderer');
  content = replaceOnce(content,
    "    card.querySelector('[data-duration]').textContent = t('seconds', { value: challenge.durationSeconds });",
    "    card.querySelector('[data-duration]').textContent = t(challenge.statusKey || 'endless');",
    'direct endless catalog status');
  content = replaceOnce(content,
    "  elements.resultChallenge.textContent = t(challenge.nameKey);\n}",
    "  elements.resultChallenge.textContent = t(challenge.nameKey);\n  renderProgress();\n}",
    'localized progress on challenge render');
  content = replaceOnce(content,
    "  elements.instructionTarget.textContent = invited ? t('challengerTarget', { score: state.invite.target }) : dailyRecovery ? t('dailySameRoute') : t('sameRun');",
    "  elements.instructionTarget.hidden = !invited && !dailyRecovery;\n  elements.instructionTarget.textContent = invited ? t('challengerTarget', { score: state.invite.target }) : dailyRecovery ? t('dailySameRoute') : '';",
    'quiet normal entry and contextual target');
  content = replaceOnce(content,
    '  state.challengeId = id; state.result = null; renderCatalog(); renderChallengeText(); updateEntryUI();',
    '  state.challengeId = id; state.result = null; state.progressSnapshot = null; renderCatalog(); renderChallengeText(); updateEntryUI();',
    'reset progress on challenge selection');
  content = replaceOnce(content,
    "  setScreen('game'); state.result = null; elements.gameStatus.textContent = t('ready');",
    "  setScreen('game'); state.result = null; state.progressSnapshot = null; renderProgress(); elements.gameStatus.textContent = t('ready');",
    'truthful progress before runtime update');
  content = replaceOnce(content,
    "      elements.round.textContent = `${Math.min(snapshot.round + 1, snapshot.rounds)}/${snapshot.rounds}`;",
    "      state.progressSnapshot = { ...snapshot }; renderProgress(snapshot);",
    'runtime normalized progress update');
  content = replaceOnce(content,
    '  renderCatalog(); renderChallengeText(); updateEntryUI();\n  safeBeginRun();\n}',
    "  renderCatalog(); renderChallengeText(); updateEntryUI();\n  setScreen('instructions');\n}",
    'daily context-aware instruction route');
  await write('src/app.mjs', content);
}

async function patchI18n() {
  let content = await read('src/i18n.mjs');
  const replacements = [
    ["catalogHint: 'Four fast games. One score to beat.'", "catalogHint: 'Four endless skill journeys. One score to beat.'"],
    ["orbitHowTo: 'Tap or press Space when the pulse enters the bright gate.'", "orbitHowTo: 'Choose an orbit, then lock the pulse inside the marked gate. Continue until your chances end or you choose to exit.'"],
    ["echoHowTo: 'Watch the numbered tiles, then tap the same pattern in order.'", "echoHowTo: 'Watch the route, then move the marker to repeat it. Continue until your chances end or you choose to exit.'"],
    ["lumenHowTo: 'Follow direct signals, reverse mirrored ones, remember light sequences, and choose safe or risky lanes. The run continues until your chances end or you confirm exit.'", "lumenHowTo: 'Move to the signaled lane and keep choosing correctly. Continue until your chances end or you choose to exit.'"],
    ["mirrorHowTo: 'Study the pattern, then choose the option that completes its mirror.'", "mirrorHowTo: 'Move across the board and switch cells to match the transformed shape. Continue until your chances end or you choose to exit.'"],
    ["catalogHint: 'أربع ألعاب ونتيجة واحدة للتجاوز.'", "catalogHint: 'أربع رحلات مهارية لا نهائية ونتيجة واحدة للتجاوز.'"],
    ["orbitHowTo: 'المس أو اضغط مسافة عندما تدخل النبضة داخل البوابة المضيئة.'", "orbitHowTo: 'اختر مدارًا، ثم ثبّت النبضة داخل البوابة المحددة. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
    ["echoHowTo: 'راقب المربعات المرقمة ثم المس النمط نفسه بالترتيب.'", "echoHowTo: 'راقب المسار، ثم حرّك العلامة لتكراره. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
    ["lumenHowTo: 'اتبع الإشارات المباشرة، واعكس إشارات المرآة، وتذكّر تسلسل الوميض، واختر بين المسارات الآمنة وعالية المخاطرة. تستمر المحاولة حتى تنتهي فرصك أو تؤكد الخروج.'", "lumenHowTo: 'انتقل إلى المسار الذي تشير إليه العلامة وواصل الاختيار الصحيح. تستمر المحاولة حتى تنتهي فرصك أو تختار الخروج.'"],
    ["mirrorHowTo: 'راقب النمط ثم اختر الخيار الذي يكمل انعكاسه في المرآة.'", "mirrorHowTo: 'تحرّك على اللوحة وبدّل الخلايا لتطابق الشكل المحوّل. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
    ["catalogHint: 'Dört oyun. Geçilecek tek puan.'", "catalogHint: 'Dört sonsuz beceri yolculuğu. Geçilecek tek puan.'"],
    ["orbitHowTo: 'Nabız parlak kapıya girdiğinde dokun veya Boşluk tuşuna bas.'", "orbitHowTo: 'Bir yörünge seç, sonra nabzı işaretli kapının içinde kilitle. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"],
    ["echoHowTo: 'Numaralı kareleri izle, sonra aynı desene sırayla dokun.'", "echoHowTo: 'Rotayı izle, sonra işaretçiyi hareket ettirerek rotayı tekrarla. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"],
    ["lumenHowTo: 'Doğrudan işaretleri izle, aynalı işaretleri tersine çevir, ışık dizilerini hatırla ve güvenli ya da riskli şeritleri seç. Hakların bitene veya çıkışı onaylayana kadar koşu sürer.'", "lumenHowTo: 'İşaret edilen şeride geç ve doğru seçimleri sürdür. Hakların bitene veya çıkmayı seçene kadar koşu sürer.'"],
    ["mirrorHowTo: 'Deseni incele, ardından ayna yansımasını tamamlayan seçeneği seç.'", "mirrorHowTo: 'Tahtada hareket et ve dönüştürülmüş şekli eşleştirmek için hücreleri değiştir. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"]
  ];
  for (const [before, after] of replacements) content = replaceOnce(content, before, after, before.slice(0, 45));
  await write('src/i18n.mjs', content);
}

async function patchCopy() {
  const updates = {
    'src/orbit-copy.mjs': [
      ["orbitHowTo: 'Choose an orbit, read the rule, and lock the moving pulse inside the correct window. Later gates add symbol rules, safe-versus-risky routes, drifting windows, and two-lock relays. Continue until your chances end or you confirm exit.'", "orbitHowTo: 'Choose an orbit, then lock the pulse inside the marked gate. Continue until your chances end or you choose to exit.'"],
      ["orbitHowTo: 'اختر المدار واقرأ القاعدة، ثم ثبّت النبضة المتحركة داخل النافذة الصحيحة. تضيف البوابات اللاحقة قواعد رموز ومسارات آمنة أو عالية المخاطرة ونوافذ متحركة وتتابعات من قفلين. تستمر الرحلة حتى تنتهي فرصك أو تؤكد الخروج.'", "orbitHowTo: 'اختر مدارًا، ثم ثبّت النبضة داخل البوابة المحددة. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
      ["orbitHowTo: 'Bir yörünge seç, kuralı oku ve hareket eden nabzı doğru pencerenin içinde kilitle. Sonraki kapılar simge kuralları, güvenli ya da riskli rotalar, kayan pencereler ve iki kilitli röleler ekler. Hakların bitene veya çıkışı onaylayana kadar yolculuk sürer.'", "orbitHowTo: 'Bir yörünge seç, sonra nabzı işaretli kapının içinde kilitle. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"]
    ],
    'src/echo-copy.mjs': [
      ["catalogHint: 'Four games. One score to beat.'", "catalogHint: 'Four endless skill journeys. One score to beat.'"],
      ["echoHowTo: 'Watch a path, read its rule, then move the marker to reconstruct, reverse, turn, or decode it. The journey continues until your chances end or you confirm exit.'", "echoHowTo: 'Watch the route, then move the marker to repeat it. Continue until your chances end or you choose to exit.'"],
      ["catalogHint: 'أربع ألعاب ونتيجة واحدة للتجاوز.'", "catalogHint: 'أربع رحلات مهارية لا نهائية ونتيجة واحدة للتجاوز.'"],
      ["echoHowTo: 'راقب المسار واقرأ قاعدته، ثم حرّك العلامة لتكراره أو عكسه أو تدويره أو فك إشاراته. تستمر الرحلة حتى تنتهي فرصك أو تؤكد الخروج.'", "echoHowTo: 'راقب المسار، ثم حرّك العلامة لتكراره. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
      ["catalogHint: 'Dört oyun. Geçilecek tek puan.'", "catalogHint: 'Dört sonsuz beceri yolculuğu. Geçilecek tek puan.'"],
      ["echoHowTo: 'Yolu izle, kuralını oku ve işaretçiyi yolu tekrar etmek, tersine dönmek, çevirmek veya kodunu çözmek için hareket ettir. Hakların bitene veya çıkışı onaylayana kadar yolculuk sürer.'", "echoHowTo: 'Rotayı izle, sonra işaretçiyi hareket ettirerek rotayı tekrarla. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"]
    ],
    'src/mirror-copy.mjs': [
      ["mirrorHowTo: 'Read the source shape and its transformation. Move the cursor across the target board, switch cells, and rebuild the exact result. Later zones add anchors, repairs, ordered traces, rotations, and tighter route budgets. Continue until your chances end or you confirm exit.'", "mirrorHowTo: 'Move across the board and switch cells to match the transformed shape. Continue until your chances end or you choose to exit.'"],
      ["mirrorHowTo: 'اقرأ الشكل الأصلي وقاعدة تحويله، ثم حرّك المؤشر على لوحة البناء وبدّل الخلايا لتكوين النتيجة الدقيقة. تضيف المناطق اللاحقة نقاط تثبيت وإصلاحات ومسارات مرتبة ودورانًا وميزانية حركة أضيق. تستمر الرحلة حتى تنتهي فرصك أو تؤكد الخروج.'", "mirrorHowTo: 'تحرّك على اللوحة وبدّل الخلايا لتطابق الشكل المحوّل. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.'"],
      ["mirrorHowTo: 'Kaynak şekli ve dönüşüm kuralını oku. İmleci hedef tahtada hareket ettir, hücreleri değiştir ve kesin sonucu yeniden kur. Sonraki bölgeler sabit noktalar, onarımlar, sıralı izler, dönüşler ve daha sıkı hareket bütçeleri ekler. Hakların bitene veya çıkışı onaylayana kadar yolculuk sürer.'", "mirrorHowTo: 'Tahtada hareket et ve dönüştürülmüş şekli eşleştirmek için hücreleri değiştir. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.'"]
    ]
  };
  for (const [path, replacements] of Object.entries(updates)) {
    let content = await read(path);
    for (const [before, after] of replacements) content = replaceOnce(content, before, after, `${path} concise entry copy`);
    await write(path, content);
  }
}

async function patchIntegration(path, kind) {
  let content = await read(path);
  const shared = [
    ["const roundCell = document.querySelector('#round-value')?.closest('div');\n", 'round cell'],
    ["const roundLabel = roundCell?.querySelector('span');\n", 'round label'],
    ["const roundValue = document.querySelector('#round-value');\n", 'round value'],
  ];
  for (const [fragment, label] of shared) content = removeExact(content, fragment, `${kind} ${label}`);
  const durationLine = `const durationValue = document.querySelector('[data-challenge-id="${kind}"] [data-duration]');\n`;
  content = removeExact(content, durationLine, `${kind} duration reference`);
  content = content.replace(/function updateCatalogDuration\(\) \{[^\n]*\}\n/g, '');
  content = content.replace(/^\s*if \(roundLabel\)[^\n]*\n/gm, '');
  content = content.replace(/^\s*if \(roundValue\)[^\n]*\n/gm, '');
  content = content.replace(/^\s*updateCatalogDuration\(\);\n/gm, '');
  content = content.replace(/^if \(durationValue\)[\s\S]*?\n\}\n/gm, '');
  content = content.replace(/^if \(durationValue\) new MutationObserver[^\n]*\n/gm, '');
  content = content.replace(/^queueMicrotask\(updateCatalogDuration\);\n/gm, '');
  content = content.replace(/^updateCatalogDuration\(\);\n/gm, '');
  if (content.includes('roundLabel') || content.includes('roundValue') || content.includes('durationValue') || content.includes('updateCatalogDuration')) {
    throw new Error(`${kind} still owns shared catalog or HUD truth`);
  }
  await write(path, content);
}

async function patchIntegrations() {
  await patchIntegration('src/orbit-integration.mjs', 'orbit-lock');
  await patchIntegration('src/echo-integration.mjs', 'echo-grid');
  await patchIntegration('src/lumen-integration.mjs', 'lumen-lanes');
  await patchIntegration('src/mirror-integration.mjs', 'mirror-fuse');
}

async function addTests() {
  const content = `import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog } from '../src/catalog.mjs';
import { messages } from '../src/i18n.mjs';
import '../src/orbit-copy.mjs';
import '../src/echo-copy.mjs';
import '../src/mirror-copy.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('catalog owns localized endless status and challenge progress metadata', () => {
  assert.equal(catalog.length, 4);
  for (const challenge of catalog) {
    assert.equal(challenge.statusKey, 'endless');
    assert.ok(challenge.progressLabelKey);
    assert.equal('durationSeconds' in challenge, false);
  }
});

test('catalog, daily, and invitation share the compact instruction entry', async () => {
  const app = await read('src/app.mjs');
  assert.match(app, /elements\.cards\.forEach[\s\S]*selectChallenge\(card\.dataset\.challengeId\)/);
  assert.match(app, /function beginDailyRun\([\s\S]*setScreen\('instructions'\);\n\}/);
  assert.match(app, /setScreen\(initialScreenForInvite\(state\.invite\)\)/);
  assert.match(app, /elements\.instructionTarget\.hidden = !invited && !dailyRecovery/);
  assert.doesNotMatch(app, /function beginDailyRun\([\s\S]*safeBeginRun\(\);\n\}/);
});

test('shared platform renders truthful endless catalog and normalized progress directly', async () => {
  const [app, html, catalogSource] = await Promise.all([read('src/app.mjs'), read('index.html'), read('src/catalog.mjs')]);
  assert.match(app, /t\(challenge\.statusKey \|\| 'endless'\)/);
  assert.match(app, /function renderProgress\(snapshot = state\.progressSnapshot\)/);
  assert.doesNotMatch(app, /t\('seconds'/);
  assert.doesNotMatch(html, /1\/12|round-value|data-i18n="round"/);
  assert.match(html, /id="progress-label"/);
  assert.match(html, /id="progress-value">1</);
  assert.doesNotMatch(catalogSource, /durationSeconds/);
  for (const file of ['orbit-integration.mjs', 'echo-integration.mjs', 'lumen-integration.mjs', 'mirror-integration.mjs']) {
    const source = await read('src/' + file);
    assert.doesNotMatch(source, /durationValue|updateCatalogDuration|roundLabel|roundValue|round-value/);
  }
});

test('entry copy stays concise, localized, and truthful about endless exit', () => {
  const keys = ['orbitHowTo', 'echoHowTo', 'lumenHowTo', 'mirrorHowTo'];
  for (const language of ['en', 'ar', 'tr']) {
    for (const key of keys) {
      const copy = messages[language][key];
      assert.ok(copy.length > 35 && copy.length < 190, language + ':' + key);
      assert.ok(copy.split(/[.!؟]+/).filter(Boolean).length <= 2, language + ':' + key);
    }
  }
});
`;
  await write('tests/onboarding-status.test.mjs', content);
}

await patchIndex();
await patchCatalog();
await patchApp();
await patchI18n();
await patchCopy();
await patchIntegrations();
await addTests();

await unlink(new URL('scripts/worker-106-apply.mjs', root));
await unlink(new URL('.github/workflows/worker-106-apply.yml', root));
