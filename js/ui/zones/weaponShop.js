// ============================================================================
// WEAPON SHOP ZONE UI — buy weapons, equip to ninjas
// ============================================================================

import { gameState } from '../../state/gameState.js';
import { buyWeapon, equipWeapon } from '../../systems/economy.js';
import { WEAPON_CATALOG, getWeaponById } from '../../data/weapons.js';
import { openModal, updateModalBody, rerenderOpenModal } from '../modal.js';
import { showToast } from '../toast.js';

function currencyIcon(currency) {
  return currency === 'gold' ? '💰' : '🔶';
}

function shopItem(weapon) {
  const owned = gameState.state.inventory.weaponIds.includes(weapon.id);
  const balance = gameState.state.player[weapon.currency];
  const canAfford = balance >= weapon.cost;
  const b = weapon.bonuses;
  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${weapon.name} <span class="tag">${weapon.rarity}</span></div>
        <div class="card-subtitle">Req. Lv ${weapon.requiredLevel} · ATK +${b.attack} · SPD +${b.speed} · CRIT +${Math.round(b.critChance * 100)}% · Lifesteal +${Math.round(b.lifeSteal * 100)}%</div>
      </div>
      <div class="card-actions">
        <button class="btn ${weapon.currency === 'gold' ? 'btn-gold' : 'btn-karma'} buy-weapon-btn"
          data-weapon-id="${weapon.id}" ${owned || !canAfford ? 'disabled' : ''}>
          ${owned ? 'OWNED' : `BUY (${weapon.cost} ${currencyIcon(weapon.currency)})`}
        </button>
      </div>
    </div>
  `;
}

function equipRow(ninja) {
  const owned = gameState.state.inventory.weaponIds;
  const options = ['<option value="">— None —</option>']
    .concat(
      owned.map((id) => {
        const w = getWeaponById(id);
        const selected = ninja.equippedWeaponId === id ? 'selected' : '';
        const disabled = ninja.level < w.requiredLevel ? 'disabled' : '';
        return `<option value="${id}" ${selected} ${disabled}>${w.name}${disabled ? ' (level locked)' : ''}</option>`;
      })
    )
    .join('');

  return `
    <div class="card">
      <div class="card-info">
        <div class="card-title">${ninja.name}</div>
        <div class="card-subtitle">Lv ${ninja.level} ${ninja.className}</div>
        <select class="equip-select" data-ninja-id="${ninja.id}" style="margin-top:0.4rem; width:100%; font-family:inherit; font-size:1rem;">
          ${options}
        </select>
      </div>
    </div>
  `;
}

function renderBody() {
  const roster = gameState.state.roster;
  return `
    <p>Buy weapons with Gold (basic gear) or Karma (elite gear), then equip them to your ninjas.</p>
    <h3 style="margin-bottom:0.3rem;">Shop</h3>
    <div class="card-list">${WEAPON_CATALOG.map(shopItem).join('')}</div>
    <h3 style="margin:0.9rem 0 0.3rem;">Equip</h3>
    <div class="card-list">${roster.length ? roster.map(equipRow).join('') : '<div class="empty-state">No ninjas to equip.</div>'}</div>
  `;
}

function attachHandlers() {
  document.querySelectorAll('.buy-weapon-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = buyWeapon(btn.dataset.weaponId);
      if (res.ok) showToast(`Purchased ${res.weapon.name}!`, 'success');
      else showToast('Cannot purchase that weapon right now.', 'error');
    });
  });
  document.querySelectorAll('.equip-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const res = equipWeapon(sel.dataset.ninjaId, sel.value || null);
      if (res.ok) showToast('Weapon equipped.', 'success');
      else showToast('Could not equip that weapon.', 'error');
    });
  });
}

function render() {
  updateModalBody(renderBody());
  attachHandlers();
}

export function openWeaponShopModal() {
  const unsubscribe = gameState.subscribe(() => rerenderOpenModal());
  openModal('🗡️ WEAPON SHOP', renderBody(), { onRender: render, onClose: unsubscribe });
  attachHandlers();
}
