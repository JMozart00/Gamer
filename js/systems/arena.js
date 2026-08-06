// ============================================================================
// PVP ARENA BATTLES
// Runs the player's active squad against a procedurally rolled rival squad
// (see data/rivals.js). Mirrors runQuestBattle()'s HP/reward application but
// pays out against the opponent's own rewards table rather than a fixed quest.
// ============================================================================

import { gameState } from '../state/gameState.js';
import { getRelicById } from '../data/relics.js';
import { calculateBattleOutcome } from './combat.js';

export function runArenaBattle(opponent) {
  const squad = gameState.getActiveSquad().filter((n) => n.status === 'active');
  if (squad.length === 0) {
    return { ok: false, reason: 'no_active_squad' };
  }

  const activeRelicIds = gameState.state.inventory.activeRelicIds;
  const result = calculateBattleOutcome(squad, opponent.squad, {
    playerRelicIds: activeRelicIds,
    playerClanId: gameState.state.player.clanId,
  });

  for (const finalState of result.finalState) {
    if (finalState.side !== 'player') continue;
    const ninja = gameState.getNinja(finalState.id);
    if (!ninja) continue;
    ninja.currentHP = Math.round(ninja.base.health * (finalState.hp / finalState.maxHP));
    if (finalState.fainted) {
      ninja.status = 'fainted';
      ninja.currentHP = 0;
    }
  }

  let rewards = null;
  if (result.winner === 'player') {
    const goldRelicBonus = activeRelicIds
      .map(getRelicById)
      .filter((r) => r && r.effect.type === 'goldGain')
      .reduce((sum, r) => sum + r.effect.value, 0);

    const gold = Math.round(opponent.rewards.gold * (1 + goldRelicBonus));
    rewards = { gold, karma: opponent.rewards.karma, accountXP: opponent.rewards.accountXP };
    gameState.addGold(gold);
    gameState.addKarma(opponent.rewards.karma);
    gameState.addAccountXP(opponent.rewards.accountXP);
  }

  gameState.notify();
  return { ok: true, result, rewards };
}
