// ============================================================================
// DOJO / BELT TRAINING LOGIC
// Ninjas level up SOLELY by spending Karma here. See belts.js for the full
// Level 1-60 karma cost table (sums to exactly 390 karma to max a ninja).
// ============================================================================

import { gameState } from '../state/gameState.js';
import { BELT_TABLE, MAX_LEVEL, getBeltInfo } from '../data/belts.js';
import { refreshNinjaForLevel } from '../data/ninjas.js';

export const TrainResult = Object.freeze({
  OK: 'ok',
  MAX_LEVEL: 'max_level',
  NOT_ENOUGH_KARMA: 'not_enough_karma',
  NINJA_NOT_FOUND: 'ninja_not_found',
  NINJA_UNAVAILABLE: 'ninja_unavailable',
});

/** Karma cost to advance a ninja from its current level to the next. */
export function nextTrainCost(ninja) {
  if (ninja.level >= MAX_LEVEL) return null;
  return BELT_TABLE[ninja.level + 1].karmaCost;
}

/**
 * Attempts to train (level up) a ninja by one level, spending Karma.
 * Returns { result, ninja?, cost? } describing the outcome.
 */
export function trainNinja(ninjaId) {
  const ninja = gameState.getNinja(ninjaId);
  if (!ninja) return { result: TrainResult.NINJA_NOT_FOUND };
  if (ninja.status !== 'active') return { result: TrainResult.NINJA_UNAVAILABLE };
  if (ninja.level >= MAX_LEVEL) return { result: TrainResult.MAX_LEVEL };

  const cost = nextTrainCost(ninja);
  if (gameState.state.player.karma < cost) {
    return { result: TrainResult.NOT_ENOUGH_KARMA, cost };
  }

  gameState.addKarma(-cost);
  ninja.level += 1;
  refreshNinjaForLevel(ninja);
  gameState.notify();

  return { result: TrainResult.OK, ninja, cost };
}

/** Karma still required to take a ninja from its current level all the way to 60. */
export function karmaToMax(ninja) {
  let total = 0;
  for (let lvl = ninja.level + 1; lvl <= MAX_LEVEL; lvl++) {
    total += BELT_TABLE[lvl].karmaCost;
  }
  return total;
}

export function beltProgress(ninja) {
  const info = getBeltInfo(ninja.level);
  const levelInTier = ((ninja.level - 1) % 5) + 1;
  return { ...info, levelInTier, levelsPerTier: 5 };
}
