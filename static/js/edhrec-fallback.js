// edhrec-fallback.js
// Provides simple EDHREC links and Scryfall-based suggestion queries as a safe fallback (no scraping).

(function(window){
  function edhrecLinkForCommander(name){
    if(!name) return null;
    // EDHREC uses URL-friendly names (spaces -> + usually works)
    const q = encodeURIComponent(name);
    return `https://edhrec.com/commanders/${q}`;
  }

  async function suggestRemoval(colorIdentity, limit=5){
    // colorIdentity: array like ['U','B'] or [] for colorless
    const color = (colorIdentity && colorIdentity.length)? colorIdentity[0] : '';
    // build a simple scryfall query for cheap removal in the chosen color
    // This is a heuristic; Scryfall search language: q=type:instant OR type:sorcery destroy OR exile
    let q = 'q=' + encodeURIComponent('type:instant OR type:sorcery (destroy OR exile OR "deal" damage) cmc<=4');
    if(color) q += '+' + encodeURIComponent('c:' + color.toLowerCase());
    const url = `https://api.scryfall.com/cards/search?${q}&order=edhrec`; // order by edhrec popularity when available
    try{
      const res = await fetch(url);
      if(!res.ok) return [];
      const json = await res.json();
      const names = (json.data||[]).slice(0,limit).map(c=>c.name);
      return names;
    }catch(e){ return []; }
  }

  async function suggestRamp(colorIdentity, limit=5){
    const color = (colorIdentity && colorIdentity.length)? colorIdentity[0] : '';
    let q = 'q=' + encodeURIComponent('oracle:"add" mana OR ramp OR search your library for basic');
    if(color) q += '+' + encodeURIComponent('c:' + color.toLowerCase());
    const url = `https://api.scryfall.com/cards/search?${q}&order=edhrec`;
    try{
      const res = await fetch(url);
      if(!res.ok) return [];
      const json = await res.json();
      const names = (json.data||[]).slice(0,limit).map(c=>c.name);
      return names;
    }catch(e){ return []; }
  }

  window.EDHREC = { edhrecLinkForCommander, suggestRemoval, suggestRamp };
})(window);
