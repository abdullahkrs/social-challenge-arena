import { RIFT_RELAY_ID } from './rift-relay-model.mjs';

export const catalog = Object.freeze([
  Object.freeze({
    id: RIFT_RELAY_ID,
    dimension: '2.5d',
    skill: 'hybrid',
    durationSeconds: 0,
    endless: true,
    statusKey: 'endless',
    progressLabelKey: 'zone',
    icon: '◆',
    gradient: 'rift',
    nameKey: 'name',
    taglineKey: 'tagline',
    howToKey: 'howTo',
    arenaLabelKey: 'riftArenaLabel',
    controlsHintKey: 'riftControlsHint'
  })
]);

export function getChallenge(id) {
  return id === RIFT_RELAY_ID ? catalog[0] : null;
}
