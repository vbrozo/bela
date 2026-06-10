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
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  appId: ""
};
