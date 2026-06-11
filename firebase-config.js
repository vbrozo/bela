/* ============================================================
   Firebase konfiguracija
   ------------------------------------------------------------
   1. Idi na  https://console.firebase.google.com  → Add project
      (besplatno; možeš isključiti Google Analytics).
   2. U projektu: Build → Realtime Database → Create Database
      → odaberi lokaciju (europe-west1) → kreni u "test mode".
   3. Project settings (zupčanik) → "Your apps" → Web (</>)
      → registriraj app → kopiraj vrijednosti iz firebaseConfig
      i zalijepi ih ovdje dolje.
   4. Commitaj ovu datoteku. Dok je apiKey prazan, aplikacija
      radi samo lokalno (na jednom uređaju, bez dijeljenja).
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJuyr1Vzi6ElD2l2CcO3CeoaS_odDndjc",
  authDomain: "bela-874f8.firebaseapp.com",
  databaseURL: "https://bela-874f8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bela-874f8",
  storageBucket: "bela-874f8.firebasestorage.app",
  messagingSenderId: "319852694341",
  appId: "1:319852694341:web:869dcafe8fde66939acc2c"
};
