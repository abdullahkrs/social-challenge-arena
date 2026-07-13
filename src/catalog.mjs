import { CHALLENGE_ID } from './core.mjs';

export const catalog = Object.freeze([
  Object.freeze({
    id: CHALLENGE_ID,
    dimension: '2d',
    difficulty: 'adaptive',
    durationSeconds: 30,
    icon: '◎',
    gradient: 'orbit'
  })
]);

export function getChallenge(id) {
  return catalog.find((challenge) => challenge.id === id) || null;
}
