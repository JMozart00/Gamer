// ============================================================================
// WEAPON CATALOG
// Weapons modify Attack, Speed, Crit Rate, and Life Steal. Bought with Gold
// (basic gear) or Karma (elite gear) in the Weapon Shop.
// ============================================================================

export const WEAPON_CATALOG = [
  {
    id: 'wpn_wood_kunai',
    name: 'Wooden Kunai',
    rarity: 'common',
    currency: 'gold',
    cost: 50,
    requiredLevel: 1,
    bonuses: { attack: 3, speed: 0, critChance: 0, lifeSteal: 0 },
  },
  {
    id: 'wpn_iron_kunai',
    name: 'Iron Kunai',
    rarity: 'common',
    currency: 'gold',
    cost: 150,
    requiredLevel: 5,
    bonuses: { attack: 6, speed: 1, critChance: 0.01, lifeSteal: 0 },
  },
  {
    id: 'wpn_katana',
    name: 'Steel Katana',
    rarity: 'uncommon',
    currency: 'gold',
    cost: 350,
    requiredLevel: 10,
    bonuses: { attack: 11, speed: 2, critChance: 0.03, lifeSteal: 0 },
  },
  {
    id: 'wpn_sai',
    name: 'Twin Sai',
    rarity: 'uncommon',
    currency: 'gold',
    cost: 500,
    requiredLevel: 15,
    bonuses: { attack: 8, speed: 5, critChance: 0.05, lifeSteal: 0 },
  },
  {
    id: 'wpn_nunchaku',
    name: 'Shadow Nunchaku',
    rarity: 'rare',
    currency: 'gold',
    cost: 800,
    requiredLevel: 20,
    bonuses: { attack: 14, speed: 3, critChance: 0.04, lifeSteal: 0.05 },
  },
  {
    id: 'wpn_bloodfang',
    name: 'Bloodfang Dagger',
    rarity: 'rare',
    currency: 'karma',
    cost: 15,
    requiredLevel: 25,
    bonuses: { attack: 12, speed: 4, critChance: 0.06, lifeSteal: 0.12 },
  },
  {
    id: 'wpn_oni_blade',
    name: 'Oni War Blade',
    rarity: 'epic',
    currency: 'karma',
    cost: 30,
    requiredLevel: 35,
    bonuses: { attack: 22, speed: 3, critChance: 0.08, lifeSteal: 0.08 },
  },
  {
    id: 'wpn_stormbreaker',
    name: 'Stormbreaker Naginata',
    rarity: 'epic',
    currency: 'karma',
    cost: 45,
    requiredLevel: 45,
    bonuses: { attack: 28, speed: 6, critChance: 0.1, lifeSteal: 0.05 },
  },
  {
    id: 'wpn_dragonfang',
    name: 'Dragonfang Kama',
    rarity: 'legendary',
    currency: 'karma',
    cost: 70,
    requiredLevel: 55,
    bonuses: { attack: 38, speed: 8, critChance: 0.15, lifeSteal: 0.15 },
  },
];

export function getWeaponById(id) {
  return WEAPON_CATALOG.find((w) => w.id === id) || null;
}
