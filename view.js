/* ============================================================
   Tanki sloj za način prikaza. Bez odgovarajućeg ključa sučelje
   radi samo kao prikaz; s ključem se otključava unos. Provjera
   ide preko SHA-256 sažetka pa ključ ne stoji u izvornom kodu
   kao čisti tekst.
   ============================================================ */
window.makeGate = function (storeKey, hashHex) {
  async function digest(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function on() {
    try { return localStorage.getItem(storeKey) === '1'; } catch (e) { return false; }
  }
  function set(v) {
    try { v ? localStorage.setItem(storeKey, '1') : localStorage.removeItem(storeKey); } catch (e) {}
  }
  // Otvori (upit za ključ) ili zatvori. Vraća stanje nakon poziva.
  async function toggle(closeMsg) {
    if (on()) {
      if (confirm(closeMsg || 'Zatvoriti?')) { set(false); return false; }
      return true;
    }
    const v = prompt('');
    if (v === null) return false;
    if ((await digest(v)) === hashHex) { set(true); return true; }
    return false;
  }
  // Zakači skriveni okidač na element (klik otvara/zatvori).
  function arm(el, onChange, closeMsg) {
    if (!el) return;
    el.style.cursor = 'default';
    el.addEventListener('click', async () => {
      await toggle(closeMsg);
      if (onChange) onChange();
    });
  }
  return { on, set, toggle, arm, digest };
};

// Admin (tablica, postavke, ždrijeb, generiranje kola, ispis QR…)
window.ViewMode = window.makeGate('efd-bela-vm9',
  'ff2aeb5255bd772186cbdbc267330c5dfa74eb26535f8c162d930de3b79ddc2c');
window.ViewMode.full = window.ViewMode.on;  // kompatibilnost s postojećim kodom

// Upis rezultata po stolovima (brojač partije)
window.WriteMode = window.makeGate('efd-bela-wr9',
  '39a6a89707b2dc7e50f413d8c695be5bc7a91ec461a43f8fbafd764d19fe3a1f');
