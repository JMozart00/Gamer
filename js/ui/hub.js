// ============================================================================
// FLOATING ISLAND HUB — wires zone node clicks to their modals
// ============================================================================

import { openDojoModal } from './zones/dojo.js';
import { openRecruitModal } from './zones/recruit.js';
import { openWeaponShopModal } from './zones/weaponShop.js';
import { openRelicShopModal } from './zones/relicShop.js';
import { openHospitalModal } from './zones/hospital.js';
import { openDaimyoModal } from './zones/daimyo.js';

const ZONE_HANDLERS = {
  dojo: openDojoModal,
  recruit: openRecruitModal,
  weapons: openWeaponShopModal,
  relics: openRelicShopModal,
  hospital: openHospitalModal,
  daimyo: openDaimyoModal,
};

export function initHub() {
  document.querySelectorAll('.hub-node').forEach((btn) => {
    btn.addEventListener('click', () => {
      const handler = ZONE_HANDLERS[btn.dataset.zone];
      if (handler) handler();
    });
  });
}
