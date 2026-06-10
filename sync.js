/* ============================================================
   BelaSync — tanki sloj iznad Firebase Realtime Databasea.
   Pretpostavlja da su prije ovoga učitani:
     firebase-app-compat.js, firebase-database-compat.js,
     firebase-config.js
   Ako Firebase nije konfiguriran, sve metode tiho ne rade
   (aplikacija nastavlja lokalno).
   ============================================================ */
window.BelaSync = (function () {
  let db = null, ready = false;

  function configured() {
    const c = window.FIREBASE_CONFIG;
    return !!(c && c.apiKey && c.databaseURL);
  }

  function init() {
    if (ready) return true;
    if (!configured() || typeof firebase === 'undefined') return false;
    try {
      firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.database();
      ready = true;
    } catch (e) {
      console.error('Firebase init nije uspio:', e);
      return false;
    }
    return true;
  }

  function watch(id, cb) {
    if (!init()) return;
    db.ref('turniri/' + id).on('value', s => cb(s.val()));
  }

  function get(id) {
    if (!init()) return Promise.resolve(null);
    return db.ref('turniri/' + id).get().then(s => s.val());
  }

  function push(id, state) {
    if (!init()) return Promise.resolve(false);
    return db.ref('turniri/' + id).set(state).then(() => true);
  }

  // Upis rezultata jedne utakmice (samo to polje, ne cijeli state).
  // Bumpa updatedAt da organizatorov uživo-prikaz primijeti promjenu.
  function setMatch(id, r, m, s1, s2) {
    if (!init()) return Promise.resolve(false);
    const upd = {};
    upd['rounds/' + r + '/' + m + '/s1'] = s1;
    upd['rounds/' + r + '/' + m + '/s2'] = s2;
    upd['updatedAt'] = Date.now();
    return db.ref('turniri/' + id).update(upd).then(() => true);
  }

  return { configured, init, watch, get, push, setMatch };
})();
