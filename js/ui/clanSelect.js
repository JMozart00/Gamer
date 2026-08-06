// ============================================================================
// CLAN SELECT SCREEN — the game's true entry point. Renders before the HUD
// or island are shown; picking a clan locks it in for the rest of the run.
// ============================================================================

import { CLAN_LIST } from '../data/clans.js';
import { chooseClan } from '../systems/clan.js';

function clanCard(clan) {
  return `
    <button class="clan-card" data-clan-id="${clan.id}" style="--clan-color:${clan.color}; --clan-glow:${clan.glow};">
      <div class="clan-card-platform">
        <span class="clan-card-ninja clan-card-ninja-a">🥷</span>
        <span class="clan-card-ninja clan-card-ninja-b">🥷</span>
      </div>
      <div class="clan-card-badge">${clan.icon}</div>
      <div class="clan-card-name">${clan.name}</div>
      <p class="clan-card-tagline">${clan.tagline}</p>
      <div class="clan-card-bonus">${clan.bonus.label}</div>
      <span class="btn clan-card-btn">CHOOSE</span>
    </button>
  `;
}

export function renderClanSelect(container, onChosen) {
  container.innerHTML = `
    <h1 class="clan-select-title">CHOOSE A CLAN</h1>
    <p class="clan-select-subtitle">Your clan shapes your first ninja and grants a permanent squad-wide gift.</p>
    <div class="clan-cards">${CLAN_LIST.map(clanCard).join('')}</div>
  `;

  container.querySelectorAll('.clan-card').forEach((card) => {
    card.addEventListener('click', () => {
      const res = chooseClan(card.dataset.clanId);
      if (res.ok) onChosen(res.clan);
    });
  });
}
