/* ============================================================
   Turnir — čista logika švicarskog sustava (bez DOM-a).
   Sve funkcije primaju podatke kao parametre pa se mogu
   testirati nodeom. UI sloj (index.html) ih omata svojim
   stanjem.
   ============================================================ */
(function (root) {
  function matchDone(m) {
    // fin === false znači partija je još u tijeku (uživo zbroj) — ne broji se kao gotova
    return m.s1 !== null && m.s2 !== null && m.s1 !== m.s2 && m.fin !== false;
  }

  function roundDone(round) {
    return round.every(matchDone);
  }

  function allMatches(rounds) {
    return rounds.flat();
  }

  function swissFinished(rounds, numRounds) {
    return rounds.length >= numRounds &&
      rounds.slice(0, numRounds).every(roundDone);
  }

  /* ---------- statistika i poredak ---------- */
  function computeStats(rounds, numTeams) {
    const stats = {};
    for (let i = 0; i < numTeams; i++) {
      stats[i] = {team: i, played: 0, wins: 0, losses: 0, plus: 0, minus: 0, opponents: [], tiebreak: false};
    }
    allMatches(rounds).forEach(m => {
      if (!matchDone(m)) return;
      stats[m.t1].played++; stats[m.t2].played++;
      stats[m.t1].plus += m.s1; stats[m.t1].minus += m.s2;
      stats[m.t2].plus += m.s2; stats[m.t2].minus += m.s1;
      stats[m.t1].opponents.push(m.t2);
      stats[m.t2].opponents.push(m.t1);
      if (m.s1 > m.s2) { stats[m.t1].wins++; stats[m.t2].losses++; }
      else { stats[m.t2].wins++; stats[m.t1].losses++; }
    });
    // Buchholz: zbroj pobjeda svih protivnika
    for (let i = 0; i < numTeams; i++) {
      stats[i].buchholz = stats[i].opponents.reduce((sum, o) => sum + stats[o].wins, 0);
    }
    return stats;
  }

  /* Poredak:
     1. broj pobjeda
     2. međusobni susreti izjednačenih (pobjede u međusobnim)
     3. Buchholz (zbroj pobjeda protivnika)
     4. razlika bodova (+/-) = osvojeni − primljeni
  */
  function standings(rounds, numTeams, nameOf) {
    const stats = computeStats(rounds, numTeams);
    const matches = allMatches(rounds).filter(matchDone);

    const byWins = {};
    Object.values(stats).forEach(s => {
      (byWins[s.wins] = byWins[s.wins] || []).push(s);
    });

    const result = [];
    Object.keys(byWins).map(Number).sort((a, b) => b - a).forEach(w => {
      const tied = byWins[w];
      if (tied.length === 1) {
        result.push(tied[0]);
        return;
      }
      const tiedSet = new Set(tied.map(s => s.team));
      const h2h = {};
      tied.forEach(s => h2h[s.team] = 0);
      matches.forEach(m => {
        if (!tiedSet.has(m.t1) || !tiedSet.has(m.t2)) return;
        if (m.s1 > m.s2) h2h[m.t1]++; else h2h[m.t2]++;
      });
      tied.forEach(s => s.tiebreak = true);
      tied.sort((a, b) =>
        h2h[b.team] - h2h[a.team] ||
        b.buchholz - a.buchholz ||
        (b.plus - b.minus) - (a.plus - a.minus) ||
        nameOf(a.team).localeCompare(nameOf(b.team))
      );
      result.push(...tied);
    });
    return result;
  }

  /* ---------- švicarsko sparivanje ----------
     Ekipe poredane po trenutnoj tablici; sparuje od vrha prema dnu,
     preferira najbližeg po poretku (isti broj bodova), preskače već
     odigrane parove, s backtrackingom da raspored uvijek uspije. */
  function playedPairs(rounds) {
    const set = new Set();
    allMatches(rounds).forEach(m => {
      set.add(Math.min(m.t1, m.t2) + '-' + Math.max(m.t1, m.t2));
    });
    return set;
  }

  function swissPairing(rounds, numTeams, nameOf) {
    const order = standings(rounds, numTeams, nameOf).map(s => s.team);
    const played = playedPairs(rounds);

    function backtrack(remaining) {
      if (remaining.length === 0) return [];
      const first = remaining[0];
      for (let i = 1; i < remaining.length; i++) {
        const opp = remaining[i];
        if (played.has(Math.min(first, opp) + '-' + Math.max(first, opp))) continue;
        const rest = remaining.filter((_, idx) => idx !== 0 && idx !== i);
        const sub = backtrack(rest);
        if (sub !== null) return [[first, opp], ...sub];
      }
      return null;
    }

    const pairs = backtrack(order);
    if (!pairs) return null;
    return pairs.map(p => ({t1: p[0], t2: p[1], s1: null, s2: null}));
  }

  /* bodovi (pobjede) svake ekipe PRIJE zadanog kola — za prikaz uz ime */
  function winsBeforeRound(rounds, roundIdx, numTeams) {
    const wins = Array(numTeams).fill(0);
    for (let r = 0; r < roundIdx; r++) {
      rounds[r].forEach(m => {
        if (!matchDone(m)) return;
        wins[m.s1 > m.s2 ? m.t1 : m.t2]++;
      });
    }
    return wins;
  }

  /* forma ekipe po kolima: 'w' | 'l' | null (nije igrano/završeno) */
  function teamForm(rounds, team) {
    return rounds.map(round => {
      const m = round.find(x => (x.t1 === team || x.t2 === team) && matchDone(x));
      if (!m) return null;
      return ((m.t1 === team) ? m.s1 > m.s2 : m.s2 > m.s1) ? 'w' : 'l';
    });
  }

  /* međusobni rezultati: mapa "a-b" -> [bodovi a, bodovi b] */
  function h2hMap(rounds) {
    const map = {};
    allMatches(rounds).forEach(m => {
      if (!matchDone(m)) return;
      map[m.t1 + '-' + m.t2] = [m.s1, m.s2];
      map[m.t2 + '-' + m.t1] = [m.s2, m.s1];
    });
    return map;
  }

  /* serija na dvije dobivene: broj dobivenih partija svake strane
     (fin === false znači partija je još u tijeku — ne broji se) */
  function seriesWins(sets) {
    let w1 = 0, w2 = 0;
    sets.forEach(s => {
      if (s.s1 === null || s.s2 === null || s.s1 === s.s2 || s.fin === false) return;
      if (s.s1 > s.s2) w1++; else w2++;
    });
    return [w1, w2];
  }

  const api = { matchDone, roundDone, allMatches, swissFinished, computeStats,
    standings, playedPairs, swissPairing, winsBeforeRound, teamForm, h2hMap, seriesWins };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Turnir = api;
})(typeof window !== 'undefined' ? window : globalThis);
