// ============================================================================
// COMBAT SYSTEM
// Fully automated turn-based auto-battler. Turn order is driven by each
// ninja's Speed stat (with light randomization to avoid rigid ties). Damage
// factors in Weapon Damage, Ninja Base Attack, and Target Defense, plus
// Critical Hit Chance, Dodge Rate, and Life Steal.
// ============================================================================

import { getWeaponById } from '../data/weapons.js';
import { getRelicById } from '../data/relics.js';

const MAX_TURNS = 200;

/** Builds a lightweight, mutable combatant snapshot from a ninja + its gear/relics. */
function buildCombatant(ninja, side, relicIds = []) {
  const weapon = ninja.equippedWeaponId ? getWeaponById(ninja.equippedWeaponId) : null;
  const relics = relicIds.map(getRelicById).filter(Boolean);

  const relicHealthBonus = relics
    .filter((r) => r.effect.type === 'squadHealth')
    .reduce((sum, r) => sum + r.effect.value, 0);
  const relicAttackBonus = relics
    .filter((r) => r.effect.type === 'squadAttack')
    .reduce((sum, r) => sum + r.effect.value, 0);

  const maxHP = Math.round(ninja.base.health * (1 + relicHealthBonus));
  const attack = Math.round(
    (ninja.base.attack + (weapon?.bonuses.attack || 0)) * (1 + relicAttackBonus)
  );

  return {
    id: ninja.id,
    name: ninja.name,
    side,
    maxHP,
    hp: Math.min(maxHP, Math.round(maxHP * (ninja.currentHP / ninja.base.health))),
    attack,
    defense: ninja.base.defense,
    speed: ninja.base.speed + (weapon?.bonuses.speed || 0),
    critChance: clamp01(ninja.special.critChance + (weapon?.bonuses.critChance || 0)),
    dodgeChance: clamp01(ninja.special.dodgeChance),
    lifeSteal: clamp01(ninja.special.lifeSteal + (weapon?.bonuses.lifeSteal || 0)),
    fainted: false,
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function pickTarget(attacker, enemies) {
  const alive = enemies.filter((e) => !e.fainted);
  if (alive.length === 0) return null;
  // Target the lowest-HP enemy to simulate focus-fire, matching classic
  // Ninja Warz auto-battle behavior.
  return alive.reduce((lowest, e) => (e.hp < lowest.hp ? e : lowest), alive[0]);
}

function resolveAttack(attacker, target, log, rng) {
  if (rng() < target.dodgeChance) {
    log.push(`${attacker.name} attacks ${target.name} — DODGED!`);
    return;
  }

  const isCrit = rng() < attacker.critChance;
  const rawDamage = attacker.attack - target.defense * 0.5;
  let damage = Math.max(1, Math.round(rawDamage * (isCrit ? 1.75 : 1)));

  target.hp = Math.max(0, target.hp - damage);

  let entry = `${attacker.name} hits ${target.name} for ${damage}${isCrit ? ' (CRIT!)' : ''}.`;

  if (attacker.lifeSteal > 0) {
    const healed = Math.round(damage * attacker.lifeSteal);
    if (healed > 0) {
      attacker.hp = Math.min(attacker.maxHP, attacker.hp + healed);
      entry += ` Life steal +${healed} HP.`;
    }
  }

  if (target.hp === 0) {
    target.fainted = true;
    entry += ` ${target.name} has fainted!`;
  }

  log.push(entry);
}

/**
 * Simulates a full battle between two squads of ninjas.
 * @param {Array} playerNinjas - array of Ninja objects (see ninjas.js)
 * @param {Array} enemyNinjas - array of Ninja objects
 * @param {Object} [options]
 * @param {string[]} [options.playerRelicIds] - active relic ids buffing the player squad
 * @returns {{ winner: 'player'|'enemy'|'draw', log: string[], survivors: object, finalState: object[] }}
 */
export function calculateBattleOutcome(playerNinjas, enemyNinjas, options = {}) {
  const rng = options.rng || Math.random;
  const log = [];

  const combatants = [
    ...playerNinjas.map((n) => buildCombatant(n, 'player', options.playerRelicIds || [])),
    ...enemyNinjas.map((n) => buildCombatant(n, 'enemy', [])),
  ];

  log.push('Battle begins!');

  let turn = 0;
  while (turn < MAX_TURNS) {
    const playerAlive = combatants.some((c) => c.side === 'player' && !c.fainted);
    const enemyAlive = combatants.some((c) => c.side === 'enemy' && !c.fainted);
    if (!playerAlive || !enemyAlive) break;

    // Turn order each round: sort by speed (desc) with a small random jitter.
    const order = [...combatants]
      .filter((c) => !c.fainted)
      .sort((a, b) => (b.speed + rng() * 2) - (a.speed + rng() * 2));

    for (const attacker of order) {
      if (attacker.fainted) continue;
      const enemies = combatants.filter((c) => c.side !== attacker.side);
      const target = pickTarget(attacker, enemies);
      if (!target) break;
      resolveAttack(attacker, target, log, rng);
    }

    turn += 1;
  }

  const playerAlive = combatants.some((c) => c.side === 'player' && !c.fainted);
  const enemyAlive = combatants.some((c) => c.side === 'enemy' && !c.fainted);

  let winner = 'draw';
  if (playerAlive && !enemyAlive) winner = 'player';
  else if (!playerAlive && enemyAlive) winner = 'enemy';

  log.push(
    winner === 'player'
      ? 'Victory! The enemy squad has been defeated.'
      : winner === 'enemy'
      ? 'Defeat... your squad has fallen.'
      : 'The battle ends in a stalemate.'
  );

  return {
    winner,
    log,
    finalState: combatants.map((c) => ({
      id: c.id,
      side: c.side,
      hp: c.hp,
      maxHP: c.maxHP,
      fainted: c.fainted,
    })),
  };
}
