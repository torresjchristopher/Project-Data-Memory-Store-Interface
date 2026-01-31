import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Yukora Sovereign Infrastructure - SECURE CONFIG
// DO NOT COMMIT ACTUAL KEYS TO GITHUB
const firebaseConfig = {
  apiKey: "REPLACED_BY_ENV_OR_USER",
  authDomain: "schnitzelbank-a.firebaseapp.com",
  projectId: "schnitzelbank-a",
  storageBucket: "schnitzelbank-a.firebasestorage.app",
  messagingSenderId: "465517915092",
  appId: "1:465517915092:web:66332a394ee8655eb9c441",
  measurementId: "G-TNRYLNLEYT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
