// combo-matcher.js (updated)
// Client-side combo matcher that loads data/combos.json and matches against parsed deck lists.

(function(window){
  const CACHE_KEY = 'combo_db_v1';
  const ALIAS_KEY = 'combo_aliases_v1';

  async function loadCombos(){
    try{
      const cached = localStorage.getItem(CACHE_KEY);
      if(cached){
        return JSON.parse(cached);
      }
    }catch(e){/*ignore*/}
    const res = await fetch('./data/combos.json');
    if (!res.ok) throw new Error('Failed to load combos.json');
    const json = await res.json();
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify(json)); }catch(e){}
    return json;
  }

  async function loadAliases(){
    try{
      const cached = localStorage.getItem(ALIAS_KEY);
      if(cached) return JSON.parse(cached);
    }catch(e){}
    try{
      const res = await fetch('./data/aliases.json');
      if(res.ok){
        const json = await res.json();
        try{ localStorage.setItem(ALIAS_KEY, JSON.stringify(json)); }catch(e){}
        return json;
      }
    }catch(e){}
    return {};
  }

  // normalize: lower-case, remove punctuation, collapse spaces, and remove diacritics
  function normalizeName(n){
    if(!n) return '';
    // remove diacritics
    try{ n = n.normalize('NFKD').replace(/\p{Diacritic}/gu, ''); }catch(e){}
    return n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function applyAlias(name, aliases){
    if(!name) return name;
    // direct match first
    if(aliases[name]) return aliases[name] || null;
    // try normalized key
    const norm = Object.keys(aliases).find(k => normalizeName(k) === normalizeName(name));
    if(norm) return aliases[norm] || null;
    return name;
  }

  function deckNamesSet(parsed, aliases){
    const s = new Set();
    for(const p of parsed){
      const mapped = applyAlias(p.name, aliases);
      if(mapped === null || mapped === '') continue; // alias indicates ignore
      s.add(normalizeName(mapped));
    }
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
    const aliases = await loadAliases();
    const names = deckNamesSet(parsed, aliases);
    const matches = [];
    const near = [];
    for(const c of combos){
      const res = matchComboAgainstSet(c, names);
      if(res.complete){
        matches.push(Object.assign({combo: c, missing: []}, {confidence: 'high'}));
      } else if(res.missing.length <= 1){
        near.push(Object.assign({combo: c, missing: res.missing}, {confidence: 'medium'}));
      }
    }
    return { matches, near };
  }

  // expose
  window.ComboMatcher = { loadCombos, loadAliases, findCombos };
})(window);
