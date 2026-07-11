const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const experiments = readFileSync(join(__dirname, '..', 'EXPERIMENTS.md'), 'utf8');
const metrics = readFileSync(join(__dirname, '..', 'METRICS.md'), 'utf8');

const eventNames = [
  'challenge_viewed',
  'challenge_started',
  'challenge_completed',
  'result_viewed',
  'share_attempted',
  'share_completed',
  'shared_link_opened',
  'friend_completed',
  'comparison_viewed',
  'share_again_attempted',
  'share_again_completed'
];

const expectedSharer = {
  challenge_viewed: 1,
  challenge_started: 1,
  challenge_completed: 1,
  result_viewed: 1,
  share_attempted: 1,
  share_completed: 1,
  shared_link_opened: 0,
  friend_completed: 0,
  comparison_viewed: 0,
  share_again_attempted: 0,
  share_again_completed: 0
};

const expectedFriend = {
  challenge_viewed: 0,
  challenge_started: 1,
  challenge_completed: 1,
  result_viewed: 0,
  share_attempted: 0,
  share_completed: 0,
  shared_link_opened: 1,
  friend_completed: 1,
  comparison_viewed: 1,
  share_again_attempted: 1,
  share_again_completed: 1
};

const formulas = [
  'Ordinary play completion = Sharer `result_viewed` ÷ Sharer `challenge_viewed`.',
  'Initial share attempt = Sharer `share_attempted` ÷ Sharer `result_viewed`.',
  'Initial share success = Sharer `share_completed` ÷ Sharer `share_attempted`.',
  'Link-open handoff = Friend `shared_link_opened` ÷ Sharer `share_completed`.',
  'Friend completion = Friend `friend_completed` ÷ Friend `shared_link_opened`.',
  'Comparison display = Friend `comparison_viewed` ÷ Friend `friend_completed`.',
  'Re-share attempt = Friend `share_again_attempted` ÷ Friend `comparison_viewed`.',
  'Re-share success = Friend `share_again_completed` ÷ Friend `share_again_attempted`.',
  'End-to-end loop closure = Friend `share_again_completed` ÷ Sharer `challenge_viewed`.'
];

function sectionBetween(start, end) {
  const startIndex = experiments.indexOf(start);
  const endIndex = experiments.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing section start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing section end: ${end}`);
  return experiments.slice(startIndex, endIndex);
}

function parseSnapshot(section) {
  const counts = {};
  for (const match of section.matchAll(/^\| `([a-z_]+)` \| ([01]) \|$/gm)) {
    counts[match[1]] = Number(match[2]);
  }
  return counts;
}

test('E-001 remains explicitly unrun with a fixed cohort and challenge', () => {
  assert.match(experiments, /ready to run manually; no result has been collected/);
  assert.match(experiments, /Tap Sprint, 20 seconds/);
  assert.match(experiments, /10 sequential sharer-and-friend pairs/);
  assert.match(experiments, /at least 8 pairs produce valid sessions/);
  assert.match(experiments, /No experiment outcome should be claimed until the manual run actually occurs/);
});

test('role snapshots cover every allowlisted counter exactly once', () => {
  const sharerSection = sectionBetween('Expected completed sharer snapshot:', '#### Friend session');
  const friendSection = sectionBetween('Expected completed friend snapshot:', '### Valid-session rules');

  assert.deepEqual(Object.keys(parseSnapshot(sharerSection)), eventNames);
  assert.deepEqual(Object.keys(parseSnapshot(friendSection)), eventNames);
  assert.deepEqual(parseSnapshot(sharerSection), expectedSharer);
  assert.deepEqual(parseSnapshot(friendSection), expectedFriend);
});

test('experiment and metrics use the same nine conversion formulas', () => {
  for (const formula of formulas) {
    assert.ok(experiments.includes(formula), `Experiment missing formula: ${formula}`);
    assert.ok(metrics.includes(formula), `Metrics missing formula: ${formula}`);
  }

  assert.match(experiments, /denominator is zero/);
  assert.match(metrics, /zero denominator/);
  assert.match(experiments, /raw ratio above 1\.0/);
  assert.match(metrics, /raw ratio above 1\.0/);
});

test('hypothesis and decision rules retain matching thresholds', () => {
  for (const threshold of ['70%', '50%', '40%']) {
    assert.equal((experiments.match(new RegExp(threshold, 'g')) || []).length, 2);
  }

  assert.match(experiments, /\*\*Pass:\*\*/);
  assert.match(experiments, /\*\*Iterate:\*\*/);
  assert.match(experiments, /\*\*Blocked:\*\*/);
  assert.match(experiments, /Select only the earliest failing stage with the lowest conversion as the next product task/);
});

test('manual collection remains aggregate-only and privacy-safe', () => {
  const prohibitedParticipantData = [
    'names',
    'emails',
    'pair or session identifiers',
    'scores',
    'URLs or fragments',
    'timestamps',
    'screenshots',
    'device/browser details',
    'demographic data',
    'free-text participant quotes'
  ];

  for (const term of prohibitedParticipantData) {
    assert.ok(experiments.includes(term), `Missing privacy prohibition: ${term}`);
  }

  assert.match(experiments, /discard the individual snapshot/);
  assert.match(metrics, /must not retain individual snapshots/);
  assert.match(metrics, /must not be inferred from mixed-role page sessions or treated as production analytics/);
});
