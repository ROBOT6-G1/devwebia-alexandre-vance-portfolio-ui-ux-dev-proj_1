// DEVWEBIA Firebase Configuration & Initialization

const firebaseConfig = {
  apiKey: "AIzaSyAmo7pHIas2xuu05px8UvN_9m3J7XY_G4M",
  authDomain: "gen-lang-client-0592969130.firebaseapp.com",
  projectId: "gen-lang-client-0592969130",
  storageBucket: "gen-lang-client-0592969130.firebasestorage.app",
  appId: "1:327917182728:web:ef8d364929afc7bc35d6bd"
};

if (typeof firebase !== 'undefined') {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const dbId = "ai-studio-kindlogickreator-865cf4c0-5872-4edb-89e9-b90d755d5d2c";
  try {
    window.db = (dbId && dbId !== "(default)") ? firebase.app().firestore(dbId) : firebase.firestore();
  } catch (e) {
    try {
      window.db = firebase.firestore();
    } catch (err) {
      console.warn("Firestore failover to local mode:", err);
      window.db = null;
    }
  }
  
  try {
    window.auth = firebase.auth();
  } catch (e) {
    window.auth = null;
  }
}