import { ECHO_GRID_ID, LUMEN_LANES_ID, MIRROR_FUSE_ID, ORBIT_LOCK_ID } from './core.mjs';

export const catalog = Object.freeze([
  Object.freeze({
    id: ORBIT_LOCK_ID,
    dimension: '2d',
    skill: 'timing',
    endless: true,
    statusKey: 'endless',
    progressLabelKey: 'orbitGateLabel',
    icon: '◎',
    gradient: 'orbit',
    nameKey: 'orbitName',
    taglineKey: 'orbitTagline',
    howToKey: 'orbitHowTo',
    arenaLabelKey: 'orbitArenaLabel',
    controlsHintKey: 'orbitControlsHint'
  }),
  Object.freeze({
    id: ECHO_GRID_ID,
    dimension: '2d',
    skill: 'memory',
    endless: true,
    statusKey: 'endless',
    progressLabelKey: 'echoTrail',
    icon: '▦',
    gradient: 'echo',
    nameKey: 'echoName',
    taglineKey: 'echoTagline',
    howToKey: 'echoHowTo',
    arenaLabelKey: 'echoArenaLabel',
    controlsHintKey: 'echoControlsHint'
  }),
  Object.freeze({
    id: LUMEN_LANES_ID,
    dimension: '2d',
    skill: 'reaction',
    endless: true,
    statusKey: 'endless',
    progressLabelKey: 'lumenDistance',
    icon: '⇆',
    gradient: 'lumen',
    nameKey: 'lumenName',
    taglineKey: 'lumenTagline',
    howToKey: 'lumenHowTo',
    arenaLabelKey: 'lumenArenaLabel',
    controlsHintKey: 'lumenControlsHint'
  }),
  Object.freeze({
    id: MIRROR_FUSE_ID,
    dimension: '2d',
    skill: 'spatial',
    endless: true,
    statusKey: 'endless',
    progressLabelKey: 'mirrorPattern',
    icon: '◫',
    gradient: 'mirror',
    nameKey: 'mirrorName',
    taglineKey: 'mirrorTagline',
    howToKey: 'mirrorHowTo',
    arenaLabelKey: 'mirrorArenaLabel',
    controlsHintKey: 'mirrorControlsHint'
  })
]);

export function getChallenge(id) {
  return catalog.find((challenge) => challenge.id === id) || null;
}
