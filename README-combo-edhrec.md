# mtg-deck-analyzer: feature/combo-edhrec

This branch adds a small Combo DB and an EDHREC fallback integration to the client-side analyzer.

Files added:
- data/combos.json — small sample export (attribution: derived from community Commander Spellbook / PaludaNCode examples). Please see the original sources for full datasets.
- static/js/combo-matcher.js — client-side combo matcher (loads data/combos.json, finds complete combos and "1-card missing" near-misses).
- static/js/edhrec-fallback.js — generates EDHREC links (for found commanders) and uses Scryfall search as a safe fallback to suggest removal/ramp cards.
- index.html — updated UI to call the combo matcher and render EDHREC fallback suggestions.

Notes:
- The combos.json here is a small curated subset for demo purposes. If you'd like, I can pull a larger export from the Commander Spellbook-derived dataset and place it under data/ (requires attribution and careful licensing checks).
- Everything is committed to the private branch `feature/combo-edhrec`. I will not merge to main or publish publicly without your explicit approval.

Next steps I can take for you:
- Import a full combos.json from the open-source PaludaNCode project and add stronger fuzzy matching / aliases.
- Add IndexedDB persistence and a UI to manage the local combo DB (refresh, remove). 
- Optionally add a serverless helper to fetch EDHREC-derived stats if you want richer recommendations (requires agreeing on scraping/TOS decisions).

If you want me to open a PR for code review in this repo, tell me and I'll create one.