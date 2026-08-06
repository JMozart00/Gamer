// ============================================================================
// ARENA ZONE UI — squad selection, rival scouting, and PvP battle results
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { runArenaBattle } from '../../systems/arena.js';
import { generateRivalOpponents } from '../../data/rivals.js';
import { ECONOMY_CONFIG } from '../../systems/economy.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

let view = 'select'; // 'select' | 'battle'
let lastBattle = null; // { opponent, result, rewards }
let opponents = [];

function rollOpponents() {
  opponents = generateRivalOpponents(gameState.state.player.accountLevel);
}

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

function difficultyTag(difficulty) {
  return `<span class="tag tag-${difficulty.toLowerCase()}">${difficulty}</span>`;
}

function opponentCard(opponent) {
  const canFight = gameState.state.activeSquadIds.length > 0;
  const squadList = opponent.squad.map((n) => `${n.name} (${n.className} Lv${n.level})`).join(', ');
  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${opponent.icon} ${opponent.clanName} ${difficultyTag(opponent.difficulty)}</div>
        <div class="card-subtitle">${opponent.squad.length} ninjas, avg Lv ${opponent.avgLevel} — ${squadList}</div>
        <div class="card-subtitle">Rewards: ${opponent.rewards.gold} 💰 · ${opponent.rewards.karma} 🔶 · ${opponent.rewards.accountXP} XP</div>
      </div>
      <div class="card-actions">
        <button class="btn btn-danger attack-btn" data-opponent-id="${opponent.id}" ${canFight ? '' : 'disabled'}>ATTACK</button>
      </div>
    </div>
  `;
}

function renderSelectView() {
  return `
    ${squadPicker()}
    <h3 style="margin:0.9rem 0 0.3rem;">Rival Clans</h3>
    <div class="card-list">${opponents.map(opponentCard).join('')}</div>
    <div class="card-actions" style="margin-top:0.75rem;">
      <button class="btn btn-outline scout-btn">🔍 SCOUT NEW TARGETS</button>
    </div>
  `;
}

function renderBattleView() {
  const { opponent, result, rewards } = lastBattle;
  const win = result.winner === 'player';
  return `
    <div class="battle-result-banner ${win ? 'win' : 'lose'}">
      ${win ? `VICTORY! ${opponent.clanName} defeated.` : result.winner === 'enemy' ? 'DEFEAT!' : 'STALEMATE'}
    </div>
    ${rewards ? `<p>Rewards: +${rewards.gold} 💰 &nbsp; +${rewards.karma} 🔶 &nbsp; +${rewards.accountXP} XP</p>` : '<p>No rewards earned. Heal up and try again.</p>'}
    <div class="battle-log">${result.log.map((l) => `<p>${l}</p>`).join('')}</div>
    <div class="card-actions" style="margin-top:0.75rem;">
      <button class="btn btn-outline back-btn">BACK TO ARENA</button>
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
        const opponent = opponents.find((o) => o.id === btn.dataset.opponentId);
        if (!opponent) return;
        const res = runArenaBattle(opponent);
        if (!res.ok) {
          showToast('Assemble an active squad first.', 'error');
          return;
        }
        lastBattle = { opponent, result: res.result, rewards: res.rewards };
        opponents = opponents.filter((o) => o.id !== opponent.id);
        view = 'battle';
        rerenderOpenModal();
      });
    });
    document.querySelector('.scout-btn')?.addEventListener('click', () => {
      rollOpponents();
      rerenderOpenModal();
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

export function openArenaModal() {
  view = 'select';
  lastBattle = null;
  rollOpponents();
  const unsubscribe = gameState.subscribe(() => {
    if (view === 'select') rerenderOpenModal();
  });
  openModal('⚔️ ARENA', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
