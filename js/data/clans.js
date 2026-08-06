// ============================================================================
// NINJA CLANS
// Chosen once at the start of a new game. Each clan grants a permanent
// squad-wide passive and determines the starting ninja's class, giving the
// run an identity from the very first screen.
// ============================================================================

export const CLAN_LIST = [
  {
    id: 'fire',
    name: 'The Fire Clan',
    tagline: 'Strength and power guide their every action.',
    icon: '🔥',
    color: '#ff5a36',
    glow: '#ffb347',
    starterClass: 'Ronin',
    bonus: { type: 'attack', value: 0.12, label: '+12% Squad Attack' },
  },
  {
    id: 'lotus',
    name: 'The Lotus Clan',
    tagline: 'They spend their lives focused on body and soul.',
    icon: '🪷',
    color: '#5fd3a0',
    glow: '#ffc0d9',
    starterClass: 'Shinobi',
    bonus: { type: 'health', value: 0.15, label: '+15% Squad Max HP' },
  },
  {
    id: 'shadow',
    name: 'The Shadow Clan',
    tagline: 'Masters of fatal blows.',
    icon: '🌙',
    color: '#8a6cff',
    glow: '#3a2d66',
    starterClass: 'Assassin',
    bonus: { type: 'critChance', value: 0.08, label: '+8% Squad Crit Chance' },
  },
];

export function getClanById(id) {
  return CLAN_LIST.find((c) => c.id === id) || null;
}
