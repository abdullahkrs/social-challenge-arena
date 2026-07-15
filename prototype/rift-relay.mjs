import { generateRiftRun, scoreRiftAction } from '../src/rift-relay-model.mjs';

const canvas = document.querySelector('#stage');
const context = canvas.getContext('2d');
const scoreNode = document.querySelector('#score');
const zoneNode = document.querySelector('#zone');
const streakNode = document.querySelector('#streak');
const cueNode = document.querySelector('#cue');
const startPanel = document.querySelector('#start-panel');
const resultPanel = document.querySelector('#result-panel');
const finalScoreNode = document.querySelector('#final-score');
const resultDetailNode = document.querySelector('#result-detail');
const muteButton = document.querySelector('#mute-button');

let seed = Date.now() >>> 0;
let run = generateRiftRun(seed, 48);
let running = false;
let muted = false;
let lane = 1;
let targetLane = 1;
let jump = 0;
let velocity = 0;
let segmentIndex = 0;
let zoneIndex = 0;
let score = 0;
let streak = 0;
let distance = 0;
let lastFrame = 0;
let segmentProgress = 0;
let activeAudio = null;

const palette = [
  ['#071a2e', '#1c6d8f', '#5ef0ff'],
  ['#17132f', '#6651b8', '#b59cff'],
  ['#201123', '#b44a72', '#ff9fc2'],
  ['#10241e', '#2b8b71', '#73ffd0'],
  ['#25180d', '#be6f29', '#ffc36b']
];

function audioContext() {
  if (muted) return null;
  if (!activeAudio) activeAudio = new AudioContext();
  return activeAudio;
}

function tone(frequency, duration = 0.08, gain = 0.035) {
  const audio = audioContext();
  if (!audio) return;
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(gain, audio.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  oscillator.connect(volume).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

function currentZone() { return run[zoneIndex % run.length]; }
function currentSegment() { return currentZone().segments[segmentIndex % currentZone().segments.length]; }

function reset(newSeed = false) {
  if (newSeed) seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  run = generateRiftRun(seed, 48);
  lane = 1;
  targetLane = 1;
  jump = 0;
  velocity = 0;
  segmentIndex = 0;
  zoneIndex = 0;
  score = 0;
  streak = 0;
  distance = 0;
  segmentProgress = 0;
  updateHud();
}

function updateHud() {
  scoreNode.textContent = String(score);
  zoneNode.textContent = String(zoneIndex + 1);
  streakNode.textContent = String(streak);
}

function start(newSeed = false) {
  reset(newSeed);
  running = true;
  startPanel.hidden = true;
  resultPanel.hidden = true;
  lastFrame = performance.now();
  tone(420, 0.12, 0.045);
  requestAnimationFrame(frame);
}

function endRun(reason) {
  running = false;
  finalScoreNode.textContent = String(score);
  resultDetailNode.textContent = `${distance} gates · zone ${zoneIndex + 1} · ${reason}`;
  resultPanel.hidden = false;
  tone(120, 0.28, 0.05);
}

function move(delta) {
  if (!running) return;
  targetLane = Math.max(0, Math.min(2, targetLane + delta));
  tone(260 + targetLane * 80, 0.05, 0.02);
}

function doJump() {
  if (!running || jump > 0.02) return;
  velocity = 1.9;
  tone(520, 0.08, 0.03);
}

function resolveSegment() {
  const segment = currentSegment();
  const obstacle = segment.obstacle;
  const puzzle = segment.puzzle;
  let success = true;
  let puzzleSolved = false;

  if (segment.kind === 'puzzle' && puzzle) {
    success = targetLane === puzzle.correctLane;
    puzzleSolved = success;
  } else if (obstacle.type === 'low-beam') {
    success = jump < 0.2;
  } else if (obstacle.type === 'gap') {
    success = jump > 0.18;
  } else {
    success = !obstacle.blockedLanes.includes(targetLane);
  }

  if (!success) {
    endRun(segment.kind === 'puzzle' ? 'signal missed' : 'rift collision');
    return;
  }

  streak += 1;
  distance += 1;
  const accuracy = Math.max(0.25, 1 - Math.abs(lane - targetLane) * 0.25);
  score += scoreRiftAction({ distance, accuracy, streak, risk: segment.rewardMultiplier, puzzle: puzzleSolved });
  tone(puzzleSolved ? 760 : 640, 0.08, 0.03);

  segmentIndex += 1;
  if (segmentIndex >= currentZone().segments.length) {
    segmentIndex = 0;
    zoneIndex += 1;
    cueNode.textContent = currentZone().type.replace('-', ' ').toUpperCase();
    setTimeout(() => { cueNode.textContent = ''; }, 900);
    tone(880, 0.16, 0.04);
  }
  updateHud();
}

function laneX(index, depth = 1) {
  const center = canvas.width / 2;
  const spread = 105 * depth;
  return center + (index - 1) * spread;
}

function drawStage(time) {
  const zone = currentZone();
  const segment = currentSegment();
  const [background, mid, accent] = palette[zone.visualVariant % palette.length];
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, background);
  gradient.addColorStop(0.5, mid);
  gradient.addColorStop(1, '#020711');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.35;
  for (let index = 0; index < 22; index += 1) {
    const y = ((index * 61 + time * 0.05) % (canvas.height + 80)) - 40;
    const size = 1 + (index % 3);
    context.fillStyle = accent;
    context.fillRect((index * 83) % canvas.width, y, size, size * 3);
  }
  context.globalAlpha = 1;

  const horizon = 130;
  const bottom = canvas.height;
  context.strokeStyle = 'rgba(210,245,255,.24)';
  context.lineWidth = 2;
  for (let laneLine = 0; laneLine < 4; laneLine += 1) {
    const bottomX = canvas.width / 2 + (laneLine - 1.5) * 104;
    const topX = canvas.width / 2 + (laneLine - 1.5) * 22;
    context.beginPath();
    context.moveTo(topX, horizon);
    context.lineTo(bottomX, bottom);
    context.stroke();
  }

  for (let stripe = 0; stripe < 12; stripe += 1) {
    const p = ((stripe / 12 + segmentProgress) % 1);
    const eased = p * p;
    const y = horizon + eased * (bottom - horizon);
    const width = 24 + eased * 330;
    context.strokeStyle = `rgba(255,255,255,${0.06 + eased * 0.15})`;
    context.beginPath();
    context.moveTo(canvas.width / 2 - width / 2, y);
    context.lineTo(canvas.width / 2 + width / 2, y);
    context.stroke();
  }

  const obstacleDepth = Math.max(0.08, Math.min(1, segmentProgress));
  const obstacleY = horizon + obstacleDepth * obstacleDepth * 390;
  const obstacleScale = 0.25 + obstacleDepth * 0.95;
  const lanes = segment.kind === 'puzzle' && segment.puzzle
    ? [0, 1, 2]
    : segment.obstacle.blockedLanes;

  for (const obstacleLane of lanes) {
    const x = laneX(obstacleLane, obstacleScale);
    const isCorrect = segment.kind === 'puzzle' && segment.puzzle?.correctLane === obstacleLane;
    context.fillStyle = segment.kind === 'puzzle'
      ? (isCorrect ? accent : 'rgba(255,90,132,.88)')
      : 'rgba(255,91,106,.92)';
    const w = 62 * obstacleScale;
    const h = (segment.obstacle.type === 'low-beam' ? 22 : 86) * obstacleScale;
    context.fillRect(x - w / 2, obstacleY - h / 2, w, h);
    if (segment.kind === 'puzzle') {
      context.fillStyle = '#06101d';
      context.font = `${Math.max(12, 28 * obstacleScale)}px system-ui`;
      context.textAlign = 'center';
      context.fillText(['◆', '●', '▲'][obstacleLane], x, obstacleY + 8 * obstacleScale);
    }
  }

  lane += (targetLane - lane) * 0.18;
  velocity -= 0.085;
  jump = Math.max(0, jump + velocity * 0.016);
  if (jump <= 0) { jump = 0; velocity = 0; }

  const playerX = laneX(lane, 1);
  const playerY = canvas.height - 92 - jump * 115;
  context.save();
  context.translate(playerX, playerY);
  context.shadowColor = accent;
  context.shadowBlur = 26;
  context.fillStyle = accent;
  context.beginPath();
  context.moveTo(0, -22);
  context.lineTo(19, 12);
  context.lineTo(0, 24);
  context.lineTo(-19, 12);
  context.closePath();
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = '#effcff';
  context.fillRect(-4, -8, 8, 18);
  context.restore();

  if (segment.kind === 'puzzle' && segment.puzzle) {
    cueNode.textContent = `${segment.puzzle.rule.replaceAll('-', ' ')} · choose the safe signal`;
  }
}

function frame(now) {
  if (!running) return;
  const delta = Math.min(40, now - lastFrame);
  lastFrame = now;
  const speed = currentZone().difficulty.speed;
  segmentProgress += delta * 0.00024 * speed;
  if (segmentProgress >= 1) {
    segmentProgress = 0;
    resolveSegment();
  }
  drawStage(now);
  if (running) requestAnimationFrame(frame);
}

document.querySelector('#start-button').addEventListener('click', () => start(false));
document.querySelector('#replay-button').addEventListener('click', () => start(false));
document.querySelector('#new-route-button').addEventListener('click', () => start(true));
muteButton.addEventListener('click', () => {
  muted = !muted;
  muteButton.setAttribute('aria-pressed', String(muted));
  muteButton.textContent = muted ? 'Sound off' : 'Sound on';
});

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'left') move(-1);
    if (action === 'right') move(1);
    if (action === 'jump') doJump();
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
  if (event.code === 'Space' || event.key === 'ArrowUp') {
    event.preventDefault();
    doJump();
  }
});

drawStage(0);