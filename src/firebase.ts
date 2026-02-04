import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Hardcoded keys to eliminate Vercel configuration issues
const firebaseConfig = {
  apiKey: "AIzaSyB1kn7TwyUeQRLErHfM2KSD8RPi7tJarH8",
  authDomain: "schnitzelbank-a.firebaseapp.com",
  projectId: "schnitzelbank-a",
  storageBucket: "schnitzelbank-a.firebasestorage.app",
  messagingSenderId: "465517915092",
  appId: "1:465517915092:web:66332a394ee8655eb9c441",
  measurementId: "G-TNRYLNLEYT"
};

const app = initializeApp(firebaseConfig);

// EXPLICIT: Connecting to the 'schnitzelbank' database used by the Artifact CLI
// This MUST match the database ID in your Firebase Console.
export const db = getFirestore(app, "schnitzelbank");
export const storage = getStorage(app);