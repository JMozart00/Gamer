// ============================================================================
// GAME STATE MANAGEMENT
// Single source of truth for the player's save data. Persists to
// localStorage. UI modules subscribe to change notifications so the HUD /
// hub / modals can re-render whenever state mutates.
// ============================================================================

import { createNinja } from '../data/ninjas.js';

const SAVE_KEY = 'ninjaWarz.save.v1';

function defaultState() {
  return {
    player: {
      gold: 500,
      karma: 10,
      accountLevel: 1,
      accountXP: 0,
      accountXPToNext: 100,
    },
    roster: [createNinja({ className: 'Shinobi', level: 1 })],
    activeSquadIds: [],
    inventory: {
      weaponIds: [],
      relicIds: [],
      activeRelicIds: [],
    },
    hospital: {
      // ninjaId -> { endsAt: epochMs }
    },
  };
}

class GameStateStore {
  constructor() {
    this.state = this._load() || defaultState();
    if (this.state.activeSquadIds.length === 0 && this.state.roster.length) {
      this.state.activeSquadIds = [this.state.roster[0].id];
    }
    this.listeners = new Set();
  }

  _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to load save, starting fresh.', e);
      return null;
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save game state.', e);
    }
  }

  resetSave() {
    localStorage.removeItem(SAVE_KEY);
    this.state = defaultState();
    this.state.activeSquadIds = [this.state.roster[0].id];
    this.notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.save();
    this.listeners.forEach((fn) => fn(this.state));
  }

  getNinja(ninjaId) {
    return this.state.roster.find((n) => n.id === ninjaId) || null;
  }

  getActiveSquad() {
    return this.state.activeSquadIds
      .map((id) => this.getNinja(id))
      .filter(Boolean);
  }

  toggleActiveSquad(ninjaId, maxSquadSize = 4) {
    const idx = this.state.activeSquadIds.indexOf(ninjaId);
    if (idx >= 0) {
      this.state.activeSquadIds.splice(idx, 1);
    } else if (this.state.activeSquadIds.length < maxSquadSize) {
      this.state.activeSquadIds.push(ninjaId);
    }
    this.notify();
  }

  addGold(amount) {
    this.state.player.gold = Math.max(0, this.state.player.gold + amount);
  }

  addKarma(amount) {
    this.state.player.karma = Math.max(0, this.state.player.karma + amount);
  }

  addAccountXP(amount) {
    const p = this.state.player;
    p.accountXP += amount;
    while (p.accountXP >= p.accountXPToNext) {
      p.accountXP -= p.accountXPToNext;
      p.accountLevel += 1;
      p.accountXPToNext = Math.round(p.accountXPToNext * 1.25);
    }
  }
}

export const gameState = new GameStateStore();
