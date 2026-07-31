# Ninja Warz — Remake

A browser-based remake of the 2010 Facebook Flash game *Ninja Warz*, built with
vanilla HTML5 / CSS3 / JavaScript (ES modules, no build step, no framework).

## Running it

Because the app uses native ES modules (`import`/`export`), it must be served
over HTTP (not opened directly as a `file://` URL). Any static file server
works:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Project structure

```
index.html            Hub layout + HUD markup
css/style.css          Retro-styled floating island hub, HUD, modals, cards

js/data/                Static content catalogs (pure data, no state)
  belts.js               12-belt / 60-level progression table (390 total karma)
  weapons.js              Weapon catalog (gold + karma tier gear)
  relics.js                Relic catalog (squad-wide passives)
  ninjas.js                 Ninja class templates + createNinja() factory
  quests.js                  Daimyo quest list + enemy squad builders

js/state/
  gameState.js            Single source of truth; localStorage persistence;
                           pub/sub so UI re-renders on any mutation

js/systems/              Game logic (pure-ish functions operating on gameState)
  dojo.js                 trainNinja(), karma-cost lookups, belt progress
  combat.js               calculateBattleOutcome() turn-based auto-battler
  economy.js              Recruiting, shop purchases, equipping, hospital
                           healing, and running quest battles

js/ui/
  hud.js                  Persistent Gold / Karma / Account Level bar
  hub.js                  Wires the 6 floating-island nodes to their modals
  modal.js                Generic modal open/close/re-render shell
  toast.js                Lightweight toast notifications
  zones/                  One renderer per hub zone (Dojo, Recruit, Weapon
                           Shop, Relic Shop, Hospital, Daimyo)

js/main.js               App bootstrap
```

## Design notes

- **Belt progression**: 12 belts (7 standard, 5 striped master) x 5 levels
  each = levels 1-60. Karma cost per level equals the belt's tier index
  (1-12), with level 1 free and level 60 carrying a +1 "mastery trial"
  premium — this makes the full Level 1-60 karma table sum to **exactly
  390**, per spec (`BELT_TABLE` in `belts.js`, verified by a dev-time
  assertion and covered by a smoke test).
- **Combat**: turn order each round is sorted by Speed (+ small jitter to
  break ties), attackers focus-fire the lowest-HP living enemy, and damage
  factors in attack (base + weapon), target defense, crit chance/multiplier,
  dodge chance, and life steal. Battles cap at 200 rounds to guarantee
  termination.
- **Persistence**: all state lives in a single `gameState` object saved to
  `localStorage` on every mutation; the hub/HUD/modals subscribe to changes
  and re-render reactively rather than polling.
