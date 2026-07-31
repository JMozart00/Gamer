// ============================================================================
// BELT PROGRESSION SYSTEM
// 12 belts x 5 levels each = 60 levels total.
// Karma cost per level equals the belt tier index (1-7 standard, 8-12 striped
// master), except Level 1 (free starting rank) and Level 60 (a +1 "mastery
// trial" premium on the final level). This makes the full Level 1->60 karma
// table sum to EXACTLY 390, matching the design spec.
// ============================================================================

export const BELT_TIERS = [
  { tier: 1, name: 'White Belt', color: '#f5f5f5' },
  { tier: 2, name: 'Yellow Belt', color: '#f5d90a' },
  { tier: 3, name: 'Orange Belt', color: '#ff8c00' },
  { tier: 4, name: 'Green Belt', color: '#2ecc71' },
  { tier: 5, name: 'Blue Belt', color: '#3498db' },
  { tier: 6, name: 'Brown Belt', color: '#8b5a2b' },
  { tier: 7, name: 'Black Belt', color: '#1a1a1a' },
  { tier: 8, name: 'Black/Orange Stripe', color: '#1a1a1a', stripe: '#ff8c00' },
  { tier: 9, name: 'Black/Blue Stripe', color: '#1a1a1a', stripe: '#3498db' },
  { tier: 10, name: 'Black/Red Stripe', color: '#1a1a1a', stripe: '#e74c3c' },
  { tier: 11, name: 'Black/Green Stripe', color: '#1a1a1a', stripe: '#2ecc71' },
  { tier: 12, name: 'Black/Purple Stripe', color: '#1a1a1a', stripe: '#9b59b6' },
];

function tierForLevel(level) {
  return Math.ceil(level / 5); // 1..12
}

function karmaCostForLevel(level) {
  if (level === 1) return 0; // starting belt, free
  const tier = tierForLevel(level);
  if (level === 60) return tier + 1; // final mastery trial premium
  return tier;
}

// Stat caps scale per belt tier. These are the maximum base stats a ninja
// can reach purely from belt rank (before weapon/relic bonuses).
function statCapsForTier(tier) {
  return {
    health: 50 + tier * 15, // 65 .. 230
    attack: 10 + tier * 4, // 14 .. 58
    defense: 5 + tier * 3, // 8 .. 41
  };
}

/**
 * BELT_TABLE[level] (1-indexed via array, index 0 unused) gives:
 *   { level, tier, beltName, color, stripe, karmaCost, statCaps }
 * karmaCost = karma required to train INTO this level from (level - 1).
 */
export const BELT_TABLE = [null]; // index 0 placeholder so BELT_TABLE[level] works directly
for (let level = 1; level <= 60; level++) {
  const tier = tierForLevel(level);
  const beltInfo = BELT_TIERS[tier - 1];
  BELT_TABLE.push({
    level,
    tier,
    beltName: beltInfo.name,
    color: beltInfo.color,
    stripe: beltInfo.stripe || null,
    karmaCost: karmaCostForLevel(level),
    statCaps: statCapsForTier(tier),
  });
}

export const MAX_LEVEL = 60;

export const TOTAL_KARMA_TO_MAX = BELT_TABLE
  .slice(1)
  .reduce((sum, row) => sum + row.karmaCost, 0);

// Sanity check kept at module load time -- fails loudly during dev if the
// belt math above is ever changed in a way that breaks the 390 spec target.
if (TOTAL_KARMA_TO_MAX !== 390) {
  // eslint-disable-next-line no-console
  console.error(
    `BELT_TABLE karma total is ${TOTAL_KARMA_TO_MAX}, expected exactly 390.`
  );
}

export function getBeltInfo(level) {
  return BELT_TABLE[Math.max(1, Math.min(MAX_LEVEL, level))];
}
