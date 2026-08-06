// ============================================================================
// PVP ARENA — RIVAL CLAN GENERATOR
// Rival squads are procedurally rolled around the player's account level each
// time the Arena is opened (or "scouted" again), mirroring the classic Ninja
// Warz "attack list" of AI-controlled rival players.
// ============================================================================

import { createNinja, NINJA_CLASSES } from './ninjas.js';

const RIVAL_CLAN_POOL = [
  { name: 'Crimson Talon', icon: '🩸' },
  { name: 'Iron Serpent', icon: '🐍' },
  { name: 'Black Lotus', icon: '⚫' },
  { name: 'Silver Fang', icon: '🐺' },
  { name: 'Jade Viper', icon: '🟢' },
  { name: 'Storm Reaver', icon: '⛈️' },
  { name: 'Ashen Blade', icon: '🪦' },
  { name: 'Ghost Pack', icon: '👻' },
];

const CLASS_NAMES = Object.keys(NINJA_CLASSES);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function difficultyFor(rivalLevel, playerLevel) {
  const delta = rivalLevel - playerLevel;
  if (delta <= -4) return { label: 'Easy', multiplier: 0.7 };
  if (delta >= 4) return { label: 'Hard', multiplier: 1.5 };
  return { label: 'Even', multiplier: 1 };
}

/** Rolls a fresh set of AI rival squads scaled around the player's account level. */
export function generateRivalOpponents(playerLevel, count = 4) {
  const opponents = [];
  for (let i = 0; i < count; i++) {
    const clan = pick(RIVAL_CLAN_POOL);
    const rivalLevel = Math.max(1, playerLevel + randomInt(-5, 5));
    const squadSize = randomInt(2, 4);
    const squad = Array.from({ length: squadSize }, () =>
      createNinja({ className: pick(CLASS_NAMES), level: Math.max(1, rivalLevel + randomInt(-2, 2)) })
    );
    const avgLevel = Math.round(squad.reduce((sum, n) => sum + n.level, 0) / squad.length);
    const diff = difficultyFor(avgLevel, playerLevel);

    opponents.push({
      id: `rival_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      clanName: clan.name,
      icon: clan.icon,
      squad,
      avgLevel,
      difficulty: diff.label,
      rewards: {
        gold: Math.round((40 + avgLevel * 12) * diff.multiplier),
        karma: Math.max(1, Math.round((1 + avgLevel * 0.3) * diff.multiplier)),
        accountXP: Math.round((8 + avgLevel * 2) * diff.multiplier),
      },
    });
  }
  return opponents;
}
