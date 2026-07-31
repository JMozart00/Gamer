// ============================================================================
// DAIMYO QUESTS / BOSS ENCOUNTERS
// Each quest fields a fixed enemy squad (built the same way player ninjas
// are, minus save-state) and pays out Gold / Karma / account XP on victory.
// ============================================================================

import { createNinja } from './ninjas.js';

function enemySquad(defs) {
  return defs.map(({ className, name, level }) => createNinja({ className, name, level }));
}

export const QUEST_LIST = [
  {
    id: 'quest_bandit_camp',
    name: 'Bandit Camp Raid',
    description: 'Clear out a small camp of highway bandits.',
    recommendedLevel: 3,
    rewards: { gold: 120, karma: 2, accountXP: 15 },
    buildEnemySquad: () =>
      enemySquad([
        { className: 'Brawler', name: 'Bandit Thug', level: 3 },
        { className: 'Shinobi', name: 'Bandit Scout', level: 2 },
      ]),
  },
  {
    id: 'quest_forest_ambush',
    name: 'Forest Ambush',
    description: 'Rival ninjas lie in wait along the forest trail.',
    recommendedLevel: 8,
    rewards: { gold: 220, karma: 4, accountXP: 30 },
    buildEnemySquad: () =>
      enemySquad([
        { className: 'Assassin', name: 'Rogue Blade', level: 8 },
        { className: 'Shinobi', name: 'Wandering Ronin', level: 7 },
        { className: 'Brawler', name: 'Forest Brute', level: 6 },
      ]),
  },
  {
    id: 'quest_mountain_dojo',
    name: 'Rival Mountain Dojo',
    description: 'A rival clan challenges your squad to open combat.',
    recommendedLevel: 18,
    rewards: { gold: 400, karma: 8, accountXP: 60 },
    buildEnemySquad: () =>
      enemySquad([
        { className: 'Ronin', name: 'Dojo Sensei', level: 20 },
        { className: 'Assassin', name: 'Dojo Disciple', level: 16 },
        { className: 'Brawler', name: 'Dojo Guardian', level: 18 },
      ]),
  },
  {
    id: 'quest_daimyo_castle',
    name: "Daimyo's Castle Gate",
    description: 'Storm the outer gate of the Daimyo\'s fortress.',
    recommendedLevel: 35,
    rewards: { gold: 900, karma: 15, accountXP: 120 },
    buildEnemySquad: () =>
      enemySquad([
        { className: 'Brawler', name: 'Gate Sentinel', level: 36 },
        { className: 'Ronin', name: 'Castle Blade', level: 34 },
        { className: 'Assassin', name: 'Shadow Guard', level: 32 },
        { className: 'Shinobi', name: 'Castle Scout', level: 30 },
      ]),
  },
  {
    id: 'quest_daimyo_throne',
    name: 'The Daimyo Himself',
    description: 'Face the Daimyo in his throne room. The ultimate test.',
    recommendedLevel: 55,
    rewards: { gold: 2000, karma: 30, accountXP: 300 },
    buildEnemySquad: () =>
      enemySquad([
        { className: 'Ronin', name: 'The Daimyo', level: 60 },
        { className: 'Brawler', name: 'Royal Guard', level: 50 },
        { className: 'Assassin', name: 'Royal Assassin', level: 48 },
      ]),
  },
];

export function getQuestById(id) {
  return QUEST_LIST.find((q) => q.id === id) || null;
}
