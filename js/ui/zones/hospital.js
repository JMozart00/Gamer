// ============================================================================
// HOSPITAL ZONE UI — fee-based healing for fainted/injured ninjas
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { startGoldHeal, instantKarmaHeal, processHospitalRecovery, HOSPITAL_CONFIG } from '../../systems/economy.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

function formatRemaining(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ninjaRow(ninja) {
  const missingHP = ninja.base.health - ninja.currentHP;
  const hpPct = Math.round((ninja.currentHP / ninja.base.health) * 100);
  const goldCost = Math.max(5, Math.round(missingHP * HOSPITAL_CONFIG.GOLD_HEAL_COST_PER_HP));

  let actions = '<span class="tag tag-active">HEALTHY</span>';
  if (ninja.status === 'recovering') {
    const remaining = ninja.recoveryEndsAt - Date.now();
    actions = `<span class="tag tag-recovering">Recovering: ${formatRemaining(remaining)}</span>`;
  } else if (missingHP > 0) {
    actions = `
      <button class="btn btn-gold gold-heal-btn" data-ninja-id="${ninja.id}">GOLD HEAL (${goldCost} 💰, timed)</button>
      <button class="btn btn-karma karma-heal-btn" data-ninja-id="${ninja.id}">INSTANT (${HOSPITAL_CONFIG.KARMA_HEAL_COST_FLAT} 🔶)</button>
    `;
  }

  return `
    <div class="card" data-ninja-id="${ninja.id}">
      <div class="card-info">
        <div class="card-title">${ninja.name} ${ninja.status === 'fainted' ? '<span class="tag tag-fainted">FAINTED</span>' : ''}</div>
        <div class="card-subtitle">${ninja.className} · Lv ${ninja.level}</div>
        <div class="hp-bar-track"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
        <div class="card-subtitle">${ninja.currentHP}/${ninja.base.health} HP</div>
      </div>
      <div class="card-actions">${actions}</div>
    </div>
  `;
}

function renderBody() {
  const roster = gameState.state.roster;
  return `
    <p>Gold heals over time; Karma heals instantly. Fainted ninjas can't fight or train until healed.</p>
    <div class="card-list">${roster.length ? roster.map(ninjaRow).join('') : '<div class="empty-state">No ninjas yet.</div>'}</div>
  `;
}

function attachHandlers() {
  document.querySelectorAll('.gold-heal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = startGoldHeal(btn.dataset.ninjaId);
      if (res.ok) showToast(`Healing started (-${res.cost} Gold).`, 'success');
      else showToast('Not enough Gold, or ninja is already healthy.', 'error');
    });
  });
  document.querySelectorAll('.karma-heal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = instantKarmaHeal(btn.dataset.ninjaId);
      if (res.ok) showToast(`Instantly healed (-${res.cost} Karma).`, 'success');
      else showToast('Not enough Karma, or ninja is already healthy.', 'error');
    });
  });
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openHospitalModal() {
  processHospitalRecovery();
  const unsubscribe = gameState.subscribe(() => rerenderOpenModal());
  const intervalId = setInterval(() => {
    processHospitalRecovery();
    rerenderOpenModal();
  }, 1000);

  openModal('⛑️ HOSPITAL', renderBody(), {
    onRender: render,
    onClose: () => {
      unsubscribe();
      clearInterval(intervalId);
    },
  });
  attachHandlers();
}
