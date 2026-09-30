// combo-matcher.js
// Client-side combo matcher that loads data/combos.json and matches against parsed deck lists.

(function(window){
  const CACHE_KEY = 'combo_db_v1';
  async function loadCombos(){
    // try localStorage cache
    try{
      const cached = localStorage.getItem(CACHE_KEY);
      if(cached){
        return JSON.parse(cached);
      }
    }catch(e){/*ignore*/}
    const res = await fetch('./data/combos.json');
    if(!res.ok) throw new Error('Failed to load combos.json');
    const json = await res.json();
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify(json)); }catch(e){}
    return json;
  }

  function normalizeName(n){
    if(!n) return '';
    return n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function deckNamesSet(parsed){
    // parsed: [{name, count}, ...]
    const s = new Set();
    for(const p of parsed){ s.add(normalizeName(p.name)); }
    return s;
  }

  function matchComboAgainstSet(combo, namesSet){
    const needed = [];
    for(const card of combo.cards){
      const n = normalizeName(card);
      if(!namesSet.has(n)) needed.push(card);
    }
    return { missing: needed, complete: needed.length===0 };
  }

  async function findCombos(parsed){
    const combos = await loadCombos();
    const names = deckNamesSet(parsed);
    const matches = [];
    const near = [];
    for(const c of combos){
      const res = matchComboAgainstSet(c, names);
      if(res.complete){
        matches.push(Object.assign({combo: c, missing: []}, {confidence: 'high'}));
      } else if(res.missing.length <= 1){
        // near-miss: only 1 card missing
        near.push(Object.assign({combo: c, missing: res.missing}, {confidence: 'medium'}));
      }
    }
    return { matches, near };
  }

  // expose
  window.ComboMatcher = { loadCombos, findCombos };
})(window);
