/* ============================================================
   Tanki sloj za način prikaza. Bez ovog ključa sučelje radi
   samo kao prikaz (read-only); s ključem se otključava unos.
   Provjera ide preko SHA-256 sažetka pa ključ ne stoji
   u izvornom kodu kao čisti tekst.
   ============================================================ */
window.ViewMode = (function () {
  const K = 'efd-bela-vm9';
  const H = 'ff2aeb5255bd772186cbdbc267330c5dfa74eb26535f8c162d930de3b79ddc2c';

  async function digest(s) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function full() {
    try { return localStorage.getItem(K) === '1'; } catch (e) { return false; }
  }

  function set(on) {
    try { on ? localStorage.setItem(K, '1') : localStorage.removeItem(K); } catch (e) {}
  }

  // Otvori/zatvori prošireni način. Vraća stanje nakon poziva.
  async function toggle() {
    if (full()) {
      if (confirm('Zatvoriti prošireni prikaz?')) { set(false); return false; }
      return true;
    }
    const v = prompt('');
    if (v === null) return false;
    if ((await digest(v)) === H) { set(true); return true; }
    return false;
  }

  // Zakači skriveni okidač na element (klik otvara/zatvori).
  function arm(el, onChange) {
    if (!el) return;
    el.style.cursor = 'default';
    el.addEventListener('click', async () => {
      await toggle();
      if (onChange) onChange();
    });
  }

  return { full, set, toggle, arm, digest };
})();
