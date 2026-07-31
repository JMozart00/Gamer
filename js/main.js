// ============================================================================
// APP ENTRY POINT
// ============================================================================

import { initHud } from './ui/hud.js';
import { initHub } from './ui/hub.js';
import { processHospitalRecovery } from './systems/economy.js';

function init() {
  initHud();
  initHub();
  processHospitalRecovery();
  setInterval(processHospitalRecovery, 5000);
}

document.addEventListener('DOMContentLoaded', init);
