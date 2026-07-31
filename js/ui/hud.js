// ============================================================================
// PERSISTENT HUD RENDERING
// ============================================================================

import { gameState } from '../state/gameState.js';

export function renderHud() {
  const { player } = gameState.state;
  document.getElementById('hud-gold-value').textContent = player.gold.toLocaleString();
  document.getElementById('hud-karma-value').textContent = player.karma.toLocaleString();
  document.getElementById('hud-level-value').textContent = player.accountLevel;

  const pct = Math.min(100, Math.round((player.accountXP / player.accountXPToNext) * 100));
  document.getElementById('hud-xp-fill').style.width = `${pct}%`;
}

export function initHud() {
  renderHud();
  gameState.subscribe(renderHud);
}
