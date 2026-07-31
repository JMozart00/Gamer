// ============================================================================
// RELIC CATALOG
// Relics are squad-wide passives (not equipped per-ninja). Once purchased,
// a relic can be "socketed" as active; active relic effects apply to the
// whole active squad. Bought with Gold or Karma in the Relic Shop.
// ============================================================================

export const RELIC_CATALOG = [
  {
    id: 'relic_jade_amulet',
    name: 'Jade Amulet',
    description: 'A soothing charm that bolsters the squad\'s vitality.',
    currency: 'gold',
    cost: 300,
    effect: { type: 'squadHealth', value: 0.1 }, // +10% squad max HP
  },
  {
    id: 'relic_war_drum',
    name: 'War Drum',
    description: 'Rallies ninjas into a more aggressive stance.',
    currency: 'gold',
    cost: 400,
    effect: { type: 'squadAttack', value: 0.08 }, // +8% squad attack
  },
  {
    id: 'relic_merchant_coin',
    name: "Merchant's Coin",
    description: 'A lucky coin that attracts extra spoils after battle.',
    currency: 'gold',
    cost: 450,
    effect: { type: 'goldGain', value: 0.15 }, // +15% gold from battles
  },
  {
    id: 'relic_tiger_talisman',
    name: 'Tiger Talisman',
    description: 'Channels fighting spirit into raw striking power.',
    currency: 'karma',
    cost: 20,
    effect: { type: 'squadAttack', value: 0.15 }, // +15% squad attack
  },
  {
    id: 'relic_phoenix_feather',
    name: 'Phoenix Feather',
    description: 'Ancient down said to shield its bearer from mortal wounds.',
    currency: 'karma',
    cost: 25,
    effect: { type: 'squadHealth', value: 0.2 }, // +20% squad max HP
  },
  {
    id: 'relic_golden_daisho',
    name: 'Golden Daisho Crest',
    description: "A shogunate crest that doubles down on the squad's fortune.",
    currency: 'karma',
    cost: 35,
    effect: { type: 'goldGain', value: 0.3 }, // +30% gold from battles
  },
];

export function getRelicById(id) {
  return RELIC_CATALOG.find((r) => r.id === id) || null;
}
