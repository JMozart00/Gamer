// ============================================================================
// NINJA DATA MODEL & FACTORY
//
// Ninja object schema:
// {
//   id: string,
//   name: string,
//   className: 'Shinobi' | 'Brawler' | 'Assassin' | 'Ronin',
//   level: number,                 // 1-60, see belts.js
//   belt: { tier, beltName, color, stripe },
//   base: { health, attack, defense, speed }, // pre-equipment base stats
//   currentHP: number,
//   equippedWeaponId: string | null,
//   special: { critChance, dodgeChance, lifeSteal }, // class-innate, 0-1
//   status: 'active' | 'fainted' | 'recovering',
//   recoveryEndsAt: number | null, // epoch ms, set while status === 'recovering'
// }
// ============================================================================

import { getBeltInfo } from './belts.js';

export const NINJA_CLASSES = {
  Shinobi: {
    className: 'Shinobi',
    description: 'Balanced all-rounder. No glaring weaknesses.',
    baseline: { health: 40, attack: 8, defense: 6, speed: 8 },
    special: { critChance: 0.05, dodgeChance: 0.05, lifeSteal: 0 },
  },
  Brawler: {
    className: 'Brawler',
    description: 'Tanky bruiser with high health and defense, but slow.',
    baseline: { health: 60, attack: 7, defense: 10, speed: 4 },
    special: { critChance: 0.02, dodgeChance: 0.02, lifeSteal: 0 },
  },
  Assassin: {
    className: 'Assassin',
    description: 'Fast, high-crit striker that trades away survivability.',
    baseline: { health: 28, attack: 9, defense: 3, speed: 12 },
    special: { critChance: 0.15, dodgeChance: 0.1, lifeSteal: 0.05 },
  },
  Ronin: {
    className: 'Ronin',
    description: 'Wandering blade with heavy attack and life steal.',
    baseline: { health: 36, attack: 11, defense: 4, speed: 6 },
    special: { critChance: 0.08, dodgeChance: 0.04, lifeSteal: 0.1 },
  },
};

const NAME_POOL = [
  'Kaito', 'Hiro', 'Ren', 'Sora', 'Akira', 'Yuki', 'Sato', 'Tenzin',
  'Kenji', 'Ryo', 'Michi', 'Nao', 'Haru', 'Ito', 'Suzume', 'Kage',
  'Raiden', 'Shiro', 'Tsuki', 'Hana',
];

let ninjaIdCounter = 1;

function computeStatsForLevel(baseline, level) {
  const belt = getBeltInfo(level);
  const growth = (level - 1) / 59; // 0 at level 1, 1 at level 60
  return {
    health: Math.round(baseline.health + growth * (belt.statCaps.health - baseline.health)),
    attack: Math.round(baseline.attack + growth * (belt.statCaps.attack - baseline.attack)),
    defense: Math.round(baseline.defense + growth * (belt.statCaps.defense - baseline.defense)),
    speed: baseline.speed, // speed is class-innate; only weapons/relics modify it further
  };
}

export function createNinja({ className, name, level = 1 } = {}) {
  const cls = NINJA_CLASSES[className] || NINJA_CLASSES.Shinobi;
  const belt = getBeltInfo(level);
  const base = computeStatsForLevel(cls.baseline, level);

  return {
    id: `ninja_${ninjaIdCounter++}_${Date.now().toString(36)}`,
    name: name || NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)],
    className: cls.className,
    level,
    belt: {
      tier: belt.tier,
      beltName: belt.beltName,
      color: belt.color,
      stripe: belt.stripe,
    },
    base,
    currentHP: base.health,
    equippedWeaponId: null,
    special: { ...cls.special },
    status: 'active',
    recoveryEndsAt: null,
  };
}

export function recruitCost(currentRosterSize) {
  return 100 + currentRosterSize * 75; // scales with roster size
}

export function refreshNinjaForLevel(ninja) {
  const cls = NINJA_CLASSES[ninja.className];
  const belt = getBeltInfo(ninja.level);
  const newBase = computeStatsForLevel(cls.baseline, ninja.level);
  const hpRatio = ninja.currentHP / ninja.base.health;

  ninja.belt = {
    tier: belt.tier,
    beltName: belt.beltName,
    color: belt.color,
    stripe: belt.stripe,
  };
  ninja.base = newBase;
  ninja.currentHP = Math.min(newBase.health, Math.round(newBase.health * hpRatio));
  return ninja;
}
