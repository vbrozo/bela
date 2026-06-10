/* ============================================================
   Bela (belot) — bodovanje jednog dijeljenja
   ------------------------------------------------------------
   Pretpostavke (regionalne varijante se razlikuju — javi ako
   treba drugačije pa prilagodim):
     • Ukupno bodova iz štihova po dijeljenju = 162
       (152 iz karata + 10 za zadnji štih).
     • Kapot (sve štihove uzme jedna ekipa): ta ekipa dobiva
       162 + 90 bonusa = 252.
     • Zvanja (terca 20, kvarta 50, kvinta 100, 4 dečka 200,
       4 devetke 150, ostala četiri ista 100): vrijede SAMO
       ekipi s jačim zvanjem; jednako = ničija.
     • Bela (kralj + dama aduta) = 20, vrijedi ekipi koja je
       ima, neovisno o natjecanju zvanja.
     • Padanje: ekipa koja je zvala aduta mora imati STROGO
       više ukupnih bodova (štih + zvanja + bela) od protivnika;
       inače "pada" i protivnik dobiva SVE bodove iz dijeljenja.
   ============================================================ */
(function (root) {
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  /* Ulaz (deal):
       caller:       0 | 1 | null   — tko je zvao aduta
       trick0,trick1: bodovi iz štihova (zbroj = 162; kod kapota nebitno)
       kapot:        null | 0 | 1    — koja je ekipa pokupila sve štihove
       zvanja0,zvanja1: bodovi zvanja po ekipi (bez bele)
       zvanjaWinner: 0 | 1 | null    — čija zvanja vrijede; null = automatski (veće)
       bela0,bela1:  boolean         — ima li ekipa belu (20)
     Izlaz: [bodoviEkipe0, bodoviEkipe1] za to dijeljenje.
  */
  function scoreDeal(d) {
    let t0 = num(d.trick0), t1 = num(d.trick1);
    let bonus0 = 0, bonus1 = 0;

    if (d.kapot === 0) { t0 = 162; t1 = 0; bonus0 = 90; }
    else if (d.kapot === 1) { t1 = 162; t0 = 0; bonus1 = 90; }

    const z0in = num(d.zvanja0), z1in = num(d.zvanja1);
    let z0 = 0, z1 = 0;
    const w = d.zvanjaWinner;
    if (w === 0) z0 = z0in;
    else if (w === 1) z1 = z1in;
    else if (z0in > z1in) z0 = z0in;
    else if (z1in > z0in) z1 = z1in;
    // jednaka zvanja => ničija

    const b0 = d.bela0 ? 20 : 0;
    const b1 = d.bela1 ? 20 : 0;

    let s0 = t0 + bonus0 + z0 + b0;
    let s1 = t1 + bonus1 + z1 + b1;

    if (d.caller === 0 || d.caller === 1) {
      const callerS = d.caller === 0 ? s0 : s1;
      const oppS    = d.caller === 0 ? s1 : s0;
      if (callerS <= oppS) {           // zvač pao — sve protivniku
        const all = s0 + s1;
        if (d.caller === 0) { s0 = 0; s1 = all; }
        else                { s1 = 0; s0 = all; }
      }
    }
    return [s0, s1];
  }

  /* Zbroj cijele partije iz niza dijeljenja. */
  function scoreGame(deals, target) {
    let total0 = 0, total1 = 0;
    const perDeal = [];
    deals.forEach(d => {
      const [a, b] = scoreDeal(d);
      total0 += a; total1 += b;
      perDeal.push([a, b]);
    });
    let finished = false, winner = null;
    if (target != null && (total0 >= target || total1 >= target)) {
      finished = true;
      // pobjednik je onaj s više bodova kad netko prijeđe granicu
      winner = total0 === total1 ? null : (total0 > total1 ? 0 : 1);
    }
    return { total0, total1, perDeal, finished, winner };
  }

  const api = { scoreDeal, scoreGame };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Bela = api;
})(typeof window !== 'undefined' ? window : globalThis);
