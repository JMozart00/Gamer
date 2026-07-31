// ============================================================================
// DAIMYO ZONE UI — squad selection, quests, and battle results
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { runQuestBattle, ECONOMY_CONFIG } from '../../systems/economy.js';
import { QUEST_LIST, getQuestById } from '../../data/quests.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

let view = 'select'; // 'select' | 'battle'
let lastBattle = null; // { quest, result, rewards }

function squadPicker() {
  const roster = gameState.state.roster;
  const activeIds = gameState.state.activeSquadIds;
  const rows = roster
    .map((n) => {
      const inSquad = activeIds.includes(n.id);
      const disabled = n.status !== 'active' && !inSquad;
      return `
        <label class="card" style="cursor:pointer;">
          <input type="checkbox" class="squad-checkbox" data-ninja-id="${n.id}" ${inSquad ? 'checked' : ''} ${disabled ? 'disabled' : ''} style="width:20px;height:20px;" />
          <div class="card-info">
            <div class="card-title">${n.name} ${n.status !== 'active' ? `<span class="tag tag-${n.status}">${n.status}</span>` : ''}</div>
            <div class="card-subtitle">${n.className} · Lv ${n.level} · HP ${n.currentHP}/${n.base.health}</div>
          </div>
        </label>
      `;
    })
    .join('');

  return `
    <h3 style="margin-bottom:0.3rem;">Active Squad (${activeIds.length}/${ECONOMY_CONFIG.MAX_SQUAD_SIZE})</h3>
    <div class="card-list">${rows || '<div class="empty-state">Recruit ninjas first.</div>'}</div>
  `;
}

function questCard(quest) {
  const canFight = gameState.state.activeSquadIds.length > 0;
  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${quest.name}</div>
        <div class="card-subtitle">${quest.description}</div>
        <div class="card-subtitle">Recommended Lv ${quest.recommendedLevel} · Rewards: ${quest.rewards.gold} 💰 · ${quest.rewards.karma} 🔶 · ${quest.rewards.accountXP} XP</div>
      </div>
      <div class="card-actions">
        <button class="btn btn-danger attack-btn" data-quest-id="${quest.id}" ${canFight ? '' : 'disabled'}>ATTACK</button>
      </div>
    </div>
  `;
}

function renderSelectView() {
  return `
    ${squadPicker()}
    <h3 style="margin:0.9rem 0 0.3rem;">Quests</h3>
    <div class="card-list">${QUEST_LIST.map(questCard).join('')}</div>
  `;
}

function renderBattleView() {
  const { quest, result, rewards } = lastBattle;
  const win = result.winner === 'player';
  return `
    <div class="battle-result-banner ${win ? 'win' : 'lose'}">
      ${win ? `VICTORY! ${quest.name} cleared.` : result.winner === 'enemy' ? 'DEFEAT!' : 'STALEMATE'}
    </div>
    ${rewards ? `<p>Rewards: +${rewards.gold} 💰 &nbsp; +${rewards.karma} 🔶 &nbsp; +${rewards.accountXP} XP</p>` : '<p>No rewards earned. Heal up and try again.</p>'}
    <div class="battle-log">${result.log.map((l) => `<p>${l}</p>`).join('')}</div>
    <div class="card-actions" style="margin-top:0.75rem;">
      <button class="btn btn-outline back-btn">BACK TO QUESTS</button>
    </div>
  `;
}

function renderBody() {
  return view === 'battle' ? renderBattleView() : renderSelectView();
}

function attachHandlers() {
  if (view === 'select') {
    document.querySelectorAll('.squad-checkbox').forEach((cb) => {
      cb.addEventListener('change', () => {
        gameState.toggleActiveSquad(cb.dataset.ninjaId, ECONOMY_CONFIG.MAX_SQUAD_SIZE);
      });
    });
    document.querySelectorAll('.attack-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const quest = getQuestById(btn.dataset.questId);
        const res = runQuestBattle(quest);
        if (!res.ok) {
          showToast('Assemble an active squad first.', 'error');
          return;
        }
        lastBattle = { quest, result: res.result, rewards: res.rewards };
        view = 'battle';
        rerenderOpenModal();
      });
    });
  } else {
    document.querySelector('.back-btn')?.addEventListener('click', () => {
      view = 'select';
      rerenderOpenModal();
    });
  }
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openDaimyoModal() {
  view = 'select';
  lastBattle = null;
  const unsubscribe = gameState.subscribe(() => {
    if (view === 'select') rerenderOpenModal();
  });
  openModal('🏯 DAIMYO', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
