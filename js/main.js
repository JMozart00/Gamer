// ============================================================================
// APP ENTRY POINT
// ============================================================================

import { initHud } from './ui/hud.js';
import { initHub } from './ui/hub.js';
import { processHospitalRecovery } from './systems/economy.js';
import { renderClanSelect } from './ui/clanSelect.js';
import { hasChosenClan } from './systems/clan.js';

function enterHub() {
  document.getElementById('clan-select-root').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('island').classList.remove('hidden');
}

function init() {
  initHud();
  initHub();
  processHospitalRecovery();
  setInterval(processHospitalRecovery, 5000);

  if (hasChosenClan()) {
    enterHub();
  } else {
    renderClanSelect(document.getElementById('clan-select-root'), enterHub);
  }
}

document.addEventListener('DOMContentLoaded', init);
