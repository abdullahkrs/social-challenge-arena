import { CHALLENGE_IDS, SCORE_MAX, clamp, compareScores, comparisonSymbol } from './core.mjs';

export const SHARE_CARD_WIDTH = 900;
export const SHARE_CARD_HEIGHT = 1125;
export const SHARE_CARD_MAX_BYTES = 650 * 1024;

const THEMES = Object.freeze({
  'orbit-lock': Object.freeze({ accent: '#7cf6d4', secondary: '#7897ff' }),
  'echo-grid': Object.freeze({ accent: '#ffd47a', secondary: '#ff9fbc' }),
  'lumen-lanes': Object.freeze({ accent: '#7cf6d4', secondary: '#7897ff' }),
  'mirror-fuse': Object.freeze({ accent: '#c8a6ff', secondary: '#7cf6d4' })
});

function safeText(value, fallback = '') { return String(value ?? fallback).trim(); }
function safeScore(value) { return clamp(Math.trunc(Number(value) || 0), 0, SCORE_MAX); }
function formatNumber(value, language) {
  try { return new Intl.NumberFormat(language, { useGrouping: false }).format(value); }
  catch { return String(value); }
}

export function buildResultCardModel({
  challengeId, language = 'en', direction = 'ltr', appName, challengeName, score,
  challengerScore = null, labels = {}
}) {
  if (!CHALLENGE_IDS.includes(challengeId)) throw new RangeError('Unknown challenge');
  const playerScore = safeScore(score);
  const target = challengerScore === null || challengerScore === undefined ? null : safeScore(challengerScore);
  const comparison = target === null ? null : compareScores(playerScore, target);
  const locale = ['ar', 'en', 'tr'].includes(language) ? language : 'en';
  return Object.freeze({
    challengeId,
    language: locale,
    direction: direction === 'rtl' ? 'rtl' : 'ltr',
    appName: safeText(appName, 'Social Challenge Arena'),
    challengeName: safeText(challengeName),
    playerScore,
    playerScoreText: formatNumber(playerScore, locale),
    challengerScore: target,
    challengerScoreText: target === null ? '' : formatNumber(target, locale),
    mode: comparison ? 'duel' : 'solo',
    outcome: comparison?.outcome ?? null,
    difference: comparison?.difference ?? 0,
    outcomeSymbol: comparison ? comparisonSymbol(comparison.outcome) : '',
    scoreLabel: safeText(labels.score, 'Score'),
    challengerLabel: safeText(labels.challenger, 'Challenger'),
    playerLabel: safeText(labels.you, 'You'),
    outcomeText: safeText(labels.outcome),
    duelLabel: safeText(labels.duel, 'Head-to-head'),
    callToAction: safeText(labels.callToAction, 'Can you beat it?'),
    privacy: safeText(labels.privacy, 'No account. No tracking.'),
    theme: THEMES[challengeId]
  });
}

export function resultCardFileName(model) {
  const id = CHALLENGE_IDS.includes(model?.challengeId) ? model.challengeId : 'challenge';
  const score = safeScore(model?.playerScore);
  return `social-challenge-${id}-${score}.png`;
}

export function isShareCancellation(error) {
  return error?.name === 'AbortError' || (error?.name === 'NotAllowedError' && error?.message === 'Share canceled');
}

export function buildFileShareData(shareData, file) {
  if (!shareData || typeof shareData !== 'object' || !file) throw new TypeError('Invalid file-share payload');
  return { ...shareData, files: [file] };
}

export function supportsTextShare(navigatorLike, shareData) {
  if (!shareData || typeof navigatorLike?.share !== 'function') return false;
  if (typeof navigatorLike.canShare !== 'function') return true;
  try { return navigatorLike.canShare(shareData) === true; }
  catch { return false; }
}

export function supportsFileShare(navigatorLike, file) {
  if (!file || typeof navigatorLike?.share !== 'function' || typeof navigatorLike?.canShare !== 'function') return false;
  try { return navigatorLike.canShare({ files: [file] }) === true; }
  catch { return false; }
}

export function assertCardBlobSize(blob, maxBytes = SHARE_CARD_MAX_BYTES) {
  if (!blob || typeof blob.size !== 'number' || blob.size < 1) throw new Error('Empty share card');
  if (blob.size > maxBytes) throw new RangeError(`Share card exceeds ${maxBytes} bytes`);
  return blob;
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRounded(ctx, x, y, width, height, radius, fill) {
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawChallengeMark(ctx, model, centerX, centerY) {
  const { accent, secondary } = model.theme;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.lineCap = 'round';
  if (model.challengeId === 'orbit-lock') {
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 24; ctx.beginPath(); ctx.arc(0, 0, 105, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = accent; ctx.beginPath(); ctx.arc(0, 0, 105, -1.5, .1); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(15, -104, 24, 0, Math.PI * 2); ctx.fill();
  } else if (model.challengeId === 'echo-grid') {
    for (let row = 0; row < 3; row += 1) for (let col = 0; col < 3; col += 1) {
      fillRounded(ctx, -115 + col * 82, -115 + row * 82, 66, 66, 15, [1, 4, 6].includes(row * 3 + col) ? (row === 1 ? secondary : accent) : 'rgba(255,255,255,.15)');
    }
  } else if (model.challengeId === 'lumen-lanes') {
    for (let lane = -1; lane <= 1; lane += 1) fillRounded(ctx, lane * 82 - 32, -125, 64, 250, 25, lane === 1 ? accent : 'rgba(255,255,255,.13)');
    ctx.fillStyle = '#fff'; ctx.font = '900 92px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('→', 0, 0);
  } else {
    const cells = [[-78,-78],[0,-78],[-78,0],[78,0],[0,78],[78,78]];
    ctx.fillStyle = accent;
    cells.forEach(([x, y]) => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-25, -25, 50, 50); ctx.restore(); });
    ctx.strokeStyle = secondary; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, -125); ctx.lineTo(0, 125); ctx.stroke();
  }
  ctx.restore();
}

function drawText(ctx, text, x, y, { size, weight = 700, color = '#fff', align = 'start', maxWidth } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y, maxWidth);
}

function canvasToBlob(canvas, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    canvas.toBlob((blob) => {
      if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
      if (!blob) reject(new Error('Share card rendering failed'));
      else resolve(blob);
    }, 'image/png');
  });
}

export async function renderResultCard(model, {
  documentRef = document, FileCtor = File, signal, maxBytes = SHARE_CARD_MAX_BYTES
} = {}) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const canvas = documentRef.createElement('canvas');
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas unavailable');
  const { accent, secondary } = model.theme;
  const rtl = model.direction === 'rtl';
  const startX = rtl ? 810 : 90;
  const startAlign = rtl ? 'right' : 'left';
  ctx.direction = model.direction;

  const background = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  background.addColorStop(0, '#121b3e'); background.addColorStop(.58, '#080d22'); background.addColorStop(1, '#111a39');
  ctx.fillStyle = background; ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  const glow = ctx.createRadialGradient(700, 160, 20, 700, 160, 520);
  glow.addColorStop(0, `${accent}44`); glow.addColorStop(1, `${secondary}00`);
  ctx.fillStyle = glow; ctx.fillRect(0, 0, SHARE_CARD_WIDTH, 600);

  fillRounded(ctx, 55, 55, 790, 1015, 48, 'rgba(8,13,34,.68)');
  ctx.strokeStyle = 'rgba(176,193,255,.22)'; ctx.lineWidth = 2; roundedRect(ctx, 55, 55, 790, 1015, 48); ctx.stroke();

  drawText(ctx, model.appName, startX, 125, { size: 30, weight: 800, color: '#dce5ff', align: startAlign, maxWidth: 620 });
  drawText(ctx, model.challengeName, startX, 198, { size: 54, weight: 900, color: '#fff', align: startAlign, maxWidth: 700 });

  drawChallengeMark(ctx, model, 450, 385);

  if (model.mode === 'solo') {
    drawText(ctx, model.scoreLabel, 450, 600, { size: 30, weight: 800, color: '#b8c1e6', align: 'center' });
    drawText(ctx, model.playerScoreText, 450, 770, { size: 170, weight: 900, color: accent, align: 'center', maxWidth: 700 });
  } else {
    drawText(ctx, model.duelLabel, 450, 580, { size: 30, weight: 800, color: '#b8c1e6', align: 'center' });
    fillRounded(ctx, 105, 620, 690, 190, 28, 'rgba(120,151,255,.12)');
    drawText(ctx, model.challengerLabel, 270, 675, { size: 24, weight: 700, color: '#b8c1e6', align: 'center' });
    drawText(ctx, model.challengerScoreText, 270, 760, { size: 78, weight: 900, color: '#fff', align: 'center' });
    drawText(ctx, model.playerLabel, 630, 675, { size: 24, weight: 700, color: '#b8c1e6', align: 'center' });
    drawText(ctx, model.playerScoreText, 630, 760, { size: 78, weight: 900, color: accent, align: 'center' });
    fillRounded(ctx, 392, 695, 116, 88, 26, model.outcome === 'lose' ? '#ff9fbc' : model.outcome === 'tie' ? '#ffd47a' : accent);
    drawText(ctx, model.outcomeSymbol, 450, 758, { size: 64, weight: 900, color: '#071025', align: 'center' });
    drawText(ctx, model.outcomeText, 450, 855, { size: 28, weight: 800, color: '#fff', align: 'center', maxWidth: 680 });
  }

  const ctaGradient = ctx.createLinearGradient(105, 890, 795, 972);
  ctaGradient.addColorStop(0, accent); ctaGradient.addColorStop(1, secondary);
  fillRounded(ctx, 105, 890, 690, 82, 24, ctaGradient);
  drawText(ctx, model.callToAction, 450, 944, { size: 30, weight: 900, color: '#071025', align: 'center', maxWidth: 620 });
  drawText(ctx, model.privacy, 450, 1032, { size: 21, weight: 700, color: '#8d99c5', align: 'center', maxWidth: 700 });

  try {
    const blob = assertCardBlobSize(await canvasToBlob(canvas, signal), maxBytes);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const file = new FileCtor([blob], resultCardFileName(model), { type: 'image/png', lastModified: 0 });
    let disposed = false;
    return {
      file,
      size: blob.size,
      dispose() {
        if (disposed) return;
        disposed = true;
        canvas.width = 1;
        canvas.height = 1;
      }
    };
  } catch (error) {
    canvas.width = 1;
    canvas.height = 1;
    throw error;
  }
}
