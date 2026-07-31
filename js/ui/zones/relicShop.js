// ============================================================================
// RELIC SHOP ZONE UI — buy relics, toggle active squad-wide passives
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { buyRelic, toggleActiveRelic, ECONOMY_CONFIG } from '../../systems/economy.js';
import { RELIC_CATALOG } from '../../data/relics.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

const EFFECT_LABEL = {
  squadHealth: 'Squad Max HP',
  squadAttack: 'Squad Attack',
  goldGain: 'Gold from Battles',
};

function currencyIcon(currency) {
  return currency === 'gold' ? '💰' : '🔶';
}

function relicCard(relic) {
  const owned = gameState.state.inventory.relicIds.includes(relic.id);
  const active = gameState.state.inventory.activeRelicIds.includes(relic.id);
  const balance = gameState.state.player[relic.currency];
  const canAfford = balance >= relic.cost;
  const atSlotLimit = gameState.state.inventory.activeRelicIds.length >= ECONOMY_CONFIG.MAX_ACTIVE_RELICS;

  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${relic.name} ${active ? '<span class="tag tag-active">ACTIVE</span>' : ''}</div>
        <div class="card-subtitle">${relic.description}</div>
        <div class="card-subtitle">+${Math.round(relic.effect.value * 100)}% ${EFFECT_LABEL[relic.effect.type]}</div>
      </div>
      <div class="card-actions">
        ${
          owned
            ? `<button class="btn ${active ? 'btn-danger' : 'btn-outline'} toggle-relic-btn" data-relic-id="${relic.id}" ${!active && atSlotLimit ? 'disabled' : ''}>
                ${active ? 'UNEQUIP' : 'EQUIP'}
              </button>`
            : `<button class="btn ${relic.currency === 'gold' ? 'btn-gold' : 'btn-karma'} buy-relic-btn" data-relic-id="${relic.id}" ${canAfford ? '' : 'disabled'}>
                BUY (${relic.cost} ${currencyIcon(relic.currency)})
              </button>`
        }
      </div>
    </div>
  `;
}

function renderBody() {
  const activeCount = gameState.state.inventory.activeRelicIds.length;
  return `
    <p>Relics grant squad-wide passive bonuses. Up to ${ECONOMY_CONFIG.MAX_ACTIVE_RELICS} can be active at once (${activeCount}/${ECONOMY_CONFIG.MAX_ACTIVE_RELICS} equipped).</p>
    <div class="card-list">${RELIC_CATALOG.map(relicCard).join('')}</div>
  `;
}

function attachHandlers() {
  document.querySelectorAll('.buy-relic-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = buyRelic(btn.dataset.relicId);
      if (res.ok) showToast(`Acquired ${res.relic.name}!`, 'success');
      else showToast('Cannot purchase that relic right now.', 'error');
    });
  });
  document.querySelectorAll('.toggle-relic-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = toggleActiveRelic(btn.dataset.relicId);
      if (!res.ok) showToast(`Only ${ECONOMY_CONFIG.MAX_ACTIVE_RELICS} relics can be active at once.`, 'error');
    });
  });
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openRelicShopModal() {
  const unsubscribe = gameState.subscribe(() => rerenderOpenModal());
  openModal('🏺 RELIC SHOP', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
