# Ninja Warz — Remake

A browser-based remake of the 2010 Facebook Flash game *Ninja Warz*: a single
self-contained `index.html` (vanilla HTML/CSS/JS, no build step, no
framework, no dependencies) with hand-painted clan/island artwork baked in
as inline data URIs.

## Running it

Just open `index.html` in a browser — no server required. (Serving it over
HTTP works too, e.g. `python3 -m http.server 8000`.)

## What's in the game

- **Clan select**: choose Fire (+15% Attack), Lotus (+20% Health), or Shadow
  (+10% Defense, +15% Gold) — each clan is a full painted character portrait
  and re-themes the entire UI's accent color.
- **Floating island hub**: a hand-painted island background per clan
  (day/lotus, lava/fire, night/shadow) with invisible hotspots over the
  Dojo, Recruitment tent, Weapon Shop, Relic Shop, Hospital, Daimyo statue,
  and the Battle Blimp.
- **Dojo**: train ninjas with Karma to level up (belts from White to Black
  track rank, up to level 60).
- **Recruitment**: hire more ninjas (cost scales with roster size, cap 25).
- **Weapon Shop**: 9 weapons (Kunai through Dragon Fang Blade), Gold or
  Karma currency, equip per-ninja.
- **Relic Shop**: 6 permanent clan-wide perks (HP/ATK/DEF/Gold % bonuses).
- **Hospital**: injured ninjas (from lost battles) recover over time, or
  heal instantly for Gold.
- **Battle Blimp**: send a squad (up to 5) into a PvP clash against a
  randomly named rival clan, or a PvE fight against one of 3 named bosses.
  Battles resolve by comparing total squad power (with randomized variance)
  and play out as an animated dust-cloud clash with floating damage
  numbers.
- **Daimyo statue**: claim a Gold + Karma blessing every 30 seconds.
- **Idle gold**: your bank passively earns Gold every second while the tab
  is open, and pays out accumulated earnings (capped at 8h) when you
  return.

## Persistence

State autosaves every 15s and after every action, via `localStorage`
(`ninjawarz-save` key). The game code itself calls `window.storage.get/set/
delete(key)` — an async key-value API from the tool this file was
originally authored in — which is shimmed at the top of the `<script>`
block onto `localStorage` so it works standalone.
