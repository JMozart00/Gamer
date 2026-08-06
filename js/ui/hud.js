// ============================================================================
// PERSISTENT HUD RENDERING
// ============================================================================

import { gameState } from '../state/gameState.js';
import { getClanById } from '../data/clans.js';

export function renderHud() {
  const { player } = gameState.state;
  document.getElementById('hud-gold-value').textContent = player.gold.toLocaleString();
  document.getElementById('hud-karma-value').textContent = player.karma.toLocaleString();
  document.getElementById('hud-level-value').textContent = player.accountLevel;

  const pct = Math.min(100, Math.round((player.accountXP / player.accountXPToNext) * 100));
  document.getElementById('hud-xp-fill').style.width = `${pct}%`;

  const clan = player.clanId ? getClanById(player.clanId) : null;
  const badge = document.getElementById('hud-clan-badge');
  if (badge) {
    badge.textContent = clan ? clan.icon : '';
    badge.title = clan ? clan.name : '';
  }
}

export function initHud() {
  renderHud();
  gameState.subscribe(renderHud);
}
