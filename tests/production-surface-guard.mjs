export function assertProductionSurface({ label, errorBannerVisible = false, errorBannerText = '', overflowPx = 0, errorCount = 0 }) {
  const surface = String(label || 'surface');
  if (errorBannerVisible) {
    const detail = String(errorBannerText || '').trim().replace(/\s+/g, ' ');
    throw new Error(`Unexpected visible error banner on ${surface}${detail ? `: ${detail}` : ''}`);
  }
  if (Number(errorCount) > 0) throw new Error(`Runtime or request error recorded before ${surface}: ${errorCount}`);
  if (Number(overflowPx) > 1) throw new Error(`Horizontal overflow on ${surface}: ${overflowPx}px`);
}
