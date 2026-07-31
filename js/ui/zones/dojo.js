// ============================================================================
// DOJO ZONE UI — belt training
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { trainNinja, nextTrainCost, karmaToMax, TrainResult } from '../../systems/dojo.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';
import { MAX_LEVEL } from '../../data/belts.js';

function beltSwatch(ninja) {
  const stripe = ninja.belt.stripe
    ? `background: linear-gradient(90deg, ${ninja.belt.color} 50%, ${ninja.belt.stripe} 50%);`
    : `background: ${ninja.belt.color};`;
  return `<span class="belt-swatch" style="${stripe}"></span>`;
}

function ninjaRow(ninja) {
  const cost = nextTrainCost(ninja);
  const maxed = ninja.level >= MAX_LEVEL;
  const karma = gameState.state.player.karma;
  const canAfford = !maxed && karma >= cost;
  const unavailable = ninja.status !== 'active';
  const hpPct = Math.round((ninja.currentHP / ninja.base.health) * 100);

  return `
    <div class="card" data-ninja-id="${ninja.id}">
      <div class="card-info">
        <div class="card-title">${beltSwatch(ninja)}${ninja.name} <span class="tag tag-${ninja.status}">${ninja.status}</span></div>
        <div class="card-subtitle">${ninja.className} · Lv ${ninja.level}/${MAX_LEVEL} · ${ninja.belt.beltName}</div>
        <div class="card-subtitle">ATK ${ninja.base.attack} · DEF ${ninja.base.defense} · SPD ${ninja.base.speed} · HP ${ninja.currentHP}/${ninja.base.health}</div>
        <div class="hp-bar-track"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
        ${!maxed ? `<div class="card-subtitle">Karma to max: ${karmaToMax(ninja)}</div>` : '<div class="card-subtitle">MAX BELT REACHED</div>'}
      </div>
      <div class="card-actions">
        <button class="btn btn-karma train-btn" data-ninja-id="${ninja.id}" ${maxed || !canAfford || unavailable ? 'disabled' : ''}>
          ${maxed ? 'MAXED' : `TRAIN (${cost} 🔶)`}
        </button>
      </div>
    </div>
  `;
}

function renderBody() {
  const roster = gameState.state.roster;
  const rows = roster.length
    ? roster.map(ninjaRow).join('')
    : '<div class="empty-state">No ninjas yet. Visit Recruit Ninjas!</div>';
  return `
    <p>Spend Karma to advance a ninja's belt rank. Higher belts raise stat caps for Health, Attack, and Defense.</p>
    <div class="card-list">${rows}</div>
  `;
}

function attachHandlers() {
  document.querySelectorAll('.train-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { result, cost } = trainNinja(btn.dataset.ninjaId);
      if (result === TrainResult.OK) {
        showToast(`Trained! -${cost} Karma`, 'success');
      } else if (result === TrainResult.NOT_ENOUGH_KARMA) {
        showToast(`Need ${cost} Karma to train this ninja.`, 'error');
      } else if (result === TrainResult.NINJA_UNAVAILABLE) {
        showToast('This ninja must be active (not fainted) to train.', 'error');
      }
    });
  });
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openDojoModal() {
  const unsubscribe = gameState.subscribe(() => rerenderOpenModal());
  openModal('🥋 DOJO', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
