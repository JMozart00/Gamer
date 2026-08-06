// ============================================================================
// CLAN SELECTION LOGIC
// Runs once at the start of a new game (see ui/clanSelect.js). Locks in the
// player's clan, grants its passive, and mints the starting ninja.
// ============================================================================

import { gameState } from '../state/gameState.js';
import { getClanById } from '../data/clans.js';
import { createNinja } from '../data/ninjas.js';

export function chooseClan(clanId) {
  const clan = getClanById(clanId);
  if (!clan) return { ok: false, reason: 'unknown_clan' };
  if (gameState.state.player.clanId) return { ok: false, reason: 'already_chosen' };

  gameState.state.player.clanId = clan.id;
  const starter = createNinja({ className: clan.starterClass, level: 1 });
  gameState.state.roster.push(starter);
  gameState.state.activeSquadIds = [starter.id];
  gameState.notify();

  return { ok: true, clan, starter };
}

export function hasChosenClan() {
  return Boolean(gameState.state.player.clanId);
}
