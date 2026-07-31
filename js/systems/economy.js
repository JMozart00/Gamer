// ============================================================================
// INVENTORY, EQUIPMENT, HOSPITAL & ECONOMY LOGIC
// ============================================================================

import { gameState } from '../state/gameState.js';
import { createNinja, recruitCost } from '../data/ninjas.js';
import { getWeaponById } from '../data/weapons.js';
import { getRelicById } from '../data/relics.js';
import { calculateBattleOutcome } from './combat.js';

const MAX_SQUAD_SIZE = 4;
const MAX_ACTIVE_RELICS = 2;

// ---- Recruiting ------------------------------------------------------------

export function recruitNinja(className) {
  const cost = recruitCost(gameState.state.roster.length);
  if (gameState.state.player.gold < cost) {
    return { ok: false, reason: 'not_enough_gold', cost };
  }
  gameState.addGold(-cost);
  const ninja = createNinja({ className, level: 1 });
  gameState.state.roster.push(ninja);
  gameState.notify();
  return { ok: true, ninja, cost };
}

// ---- Weapon Shop ------------------------------------------------------------

export function buyWeapon(weaponId) {
  const weapon = getWeaponById(weaponId);
  if (!weapon) return { ok: false, reason: 'not_found' };
  if (gameState.state.inventory.weaponIds.includes(weaponId)) {
    return { ok: false, reason: 'already_owned' };
  }
  const balance = gameState.state.player[weapon.currency];
  if (balance < weapon.cost) return { ok: false, reason: 'insufficient_funds' };

  weapon.currency === 'gold' ? gameState.addGold(-weapon.cost) : gameState.addKarma(-weapon.cost);
  gameState.state.inventory.weaponIds.push(weaponId);
  gameState.notify();
  return { ok: true, weapon };
}

export function equipWeapon(ninjaId, weaponId) {
  const ninja = gameState.getNinja(ninjaId);
  if (!ninja) return { ok: false, reason: 'ninja_not_found' };
  if (weaponId && !gameState.state.inventory.weaponIds.includes(weaponId)) {
    return { ok: false, reason: 'not_owned' };
  }
  const weapon = weaponId ? getWeaponById(weaponId) : null;
  if (weapon && ninja.level < weapon.requiredLevel) {
    return { ok: false, reason: 'level_too_low' };
  }
  ninja.equippedWeaponId = weaponId || null;
  gameState.notify();
  return { ok: true, ninja };
}

// ---- Relic Shop ------------------------------------------------------------

export function buyRelic(relicId) {
  const relic = getRelicById(relicId);
  if (!relic) return { ok: false, reason: 'not_found' };
  if (gameState.state.inventory.relicIds.includes(relicId)) {
    return { ok: false, reason: 'already_owned' };
  }
  const balance = gameState.state.player[relic.currency];
  if (balance < relic.cost) return { ok: false, reason: 'insufficient_funds' };

  relic.currency === 'gold' ? gameState.addGold(-relic.cost) : gameState.addKarma(-relic.cost);
  gameState.state.inventory.relicIds.push(relicId);
  gameState.notify();
  return { ok: true, relic };
}

export function toggleActiveRelic(relicId) {
  const active = gameState.state.inventory.activeRelicIds;
  const idx = active.indexOf(relicId);
  if (idx >= 0) {
    active.splice(idx, 1);
  } else {
    if (active.length >= MAX_ACTIVE_RELICS) return { ok: false, reason: 'slot_limit' };
    active.push(relicId);
  }
  gameState.notify();
  return { ok: true };
}

// ---- Hospital ---------------------------------------------------------------

const GOLD_HEAL_MS_PER_HP = 4000; // 4s of recovery time per missing HP
const GOLD_HEAL_COST_PER_HP = 2;
const KARMA_HEAL_COST_FLAT = 3; // instant, flat karma cost regardless of missing HP

export function startGoldHeal(ninjaId) {
  const ninja = gameState.getNinja(ninjaId);
  if (!ninja || ninja.currentHP >= ninja.base.health) {
    return { ok: false, reason: 'not_injured' };
  }
  const missingHP = ninja.base.health - ninja.currentHP;
  const cost = Math.max(5, Math.round(missingHP * GOLD_HEAL_COST_PER_HP));
  if (gameState.state.player.gold < cost) return { ok: false, reason: 'insufficient_funds' };

  gameState.addGold(-cost);
  ninja.status = 'recovering';
  ninja.recoveryEndsAt = Date.now() + missingHP * GOLD_HEAL_MS_PER_HP;
  gameState.state.hospital[ninjaId] = { endsAt: ninja.recoveryEndsAt };
  gameState.notify();
  return { ok: true, cost, endsAt: ninja.recoveryEndsAt };
}

export function instantKarmaHeal(ninjaId) {
  const ninja = gameState.getNinja(ninjaId);
  if (!ninja || ninja.currentHP >= ninja.base.health) {
    return { ok: false, reason: 'not_injured' };
  }
  if (gameState.state.player.karma < KARMA_HEAL_COST_FLAT) {
    return { ok: false, reason: 'insufficient_funds' };
  }
  gameState.addKarma(-KARMA_HEAL_COST_FLAT);
  ninja.currentHP = ninja.base.health;
  ninja.status = 'active';
  ninja.recoveryEndsAt = null;
  delete gameState.state.hospital[ninjaId];
  gameState.notify();
  return { ok: true, cost: KARMA_HEAL_COST_FLAT };
}

/** Call periodically (e.g. on a timer or hub open) to resolve finished gold-heals. */
export function processHospitalRecovery() {
  const now = Date.now();
  let changed = false;
  for (const ninja of gameState.state.roster) {
    if (ninja.status === 'recovering' && ninja.recoveryEndsAt && now >= ninja.recoveryEndsAt) {
      ninja.currentHP = ninja.base.health;
      ninja.status = 'active';
      ninja.recoveryEndsAt = null;
      delete gameState.state.hospital[ninja.id];
      changed = true;
    }
  }
  if (changed) gameState.notify();
}

// ---- Battles ------------------------------------------------------------

/**
 * Runs a quest battle for the player's active squad, applies HP/faint results
 * back onto the roster, and grants rewards on victory.
 */
export function runQuestBattle(quest) {
  const squad = gameState.getActiveSquad().filter((n) => n.status === 'active');
  if (squad.length === 0) {
    return { ok: false, reason: 'no_active_squad' };
  }

  const enemySquad = quest.buildEnemySquad();
  const activeRelicIds = gameState.state.inventory.activeRelicIds;
  const result = calculateBattleOutcome(squad, enemySquad, { playerRelicIds: activeRelicIds });

  // Apply post-battle HP/faint state back onto the player's persistent roster.
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

    const gold = Math.round(quest.rewards.gold * (1 + goldRelicBonus));
    rewards = { gold, karma: quest.rewards.karma, accountXP: quest.rewards.accountXP };
    gameState.addGold(gold);
    gameState.addKarma(quest.rewards.karma);
    gameState.addAccountXP(quest.rewards.accountXP);
  }

  gameState.notify();
  return { ok: true, result, rewards };
}

export const HOSPITAL_CONFIG = {
  GOLD_HEAL_MS_PER_HP,
  GOLD_HEAL_COST_PER_HP,
  KARMA_HEAL_COST_FLAT,
};

export const ECONOMY_CONFIG = { MAX_SQUAD_SIZE, MAX_ACTIVE_RELICS };
