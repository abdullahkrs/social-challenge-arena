import { ECHO_GRID_ID, ORBIT_LOCK_ID } from './core.mjs';

export const catalog = Object.freeze([
  Object.freeze({
    id: ORBIT_LOCK_ID,
    dimension: '2d',
    skill: 'timing',
    durationSeconds: 30,
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
    durationSeconds: 40,
    icon: '▦',
    gradient: 'echo',
    nameKey: 'echoName',
    taglineKey: 'echoTagline',
    howToKey: 'echoHowTo',
    arenaLabelKey: 'echoArenaLabel',
    controlsHintKey: 'echoControlsHint'
  })
]);

export function getChallenge(id) {
  return catalog.find((challenge) => challenge.id === id) || null;
}
