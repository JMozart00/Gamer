// ============================================================================
// RECRUIT NINJAS ZONE UI
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { recruitNinja } from '../../systems/economy.js';
import { NINJA_CLASSES, recruitCost } from '../../data/ninjas.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

function classCard(className) {
  const cls = NINJA_CLASSES[className];
  const cost = recruitCost(gameState.state.roster.length);
  const canAfford = gameState.state.player.gold >= cost;
  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${cls.className}</div>
        <div class="card-subtitle">${cls.description}</div>
        <div class="card-subtitle">
          HP ${cls.baseline.health} · ATK ${cls.baseline.attack} · DEF ${cls.baseline.defense} · SPD ${cls.baseline.speed}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-gold recruit-btn" data-class="${className}" ${canAfford ? '' : 'disabled'}>
          RECRUIT (${cost} 💰)
        </button>
      </div>
    </div>
  `;
}

function renderBody() {
  return `
    <p>Recruit a new ninja to your roster. Cost scales with roster size.</p>
    <div class="card-list">${Object.keys(NINJA_CLASSES).map(classCard).join('')}</div>
  `;
}

function attachHandlers() {
  document.querySelectorAll('.recruit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = recruitNinja(btn.dataset.class);
      if (res.ok) {
        showToast(`${res.ninja.name} the ${res.ninja.className} joined your ranks!`, 'success');
      } else {
        showToast('Not enough Gold to recruit.', 'error');
      }
    });
  });
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openRecruitModal() {
  const unsubscribe = gameState.subscribe(() => rerenderOpenModal());
  openModal('🧑‍🤝‍🧑 RECRUIT NINJAS', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
