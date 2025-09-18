// Debug: Log the current ariseUser from localStorage
console.log('ariseUser in localStorage:', localStorage.getItem('ariseUser'));
// firebase.jsx
// --------------------------------------------
// Firebase config + auth with offline fallback
// --------------------------------------------

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "firebase/firestore";

// 🔑 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCuMsPe44bdghEH7zGUEP0H-0v9HX7lS24",
  authDomain: "arise-69e14.firebaseapp.com",
  projectId: "arise-69e14",
  storageBucket: "arise-69e14.appspot.com",
  messagingSenderId: "274996913513",
  appId: "1:274996913513:web:61466104239654258c09f8",
  measurementId: "G-8RMFB3BBSY"
};

// 🔥 Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Force persistent login
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistence set to localStorage");
  })
  .catch((err) => {
    console.error("⚠️ Persistence setup failed:", err);
  });

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function isOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// ------------------------------------------------------
// Sign in with Google (online only, else fallback cache)
// ------------------------------------------------------
export const signInWithGoogle = async () => {
  try {
    if (isOnline()) {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        provider: "google"
      };
      localStorage.setItem("ariseUser", JSON.stringify(userData));
      return userData;
    } else {
      // fallback to offline mode
      const cachedUser = localStorage.getItem("ariseUser");
      if (cachedUser) {
        return JSON.parse(cachedUser);
      } else {
        throw new Error("No offline user data found. Please sign in online at least once.");
      }
    }
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      console.warn("⚠️ User closed the Google login popup");
      return null;
    }
    console.error("❌ Google Sign-In error:", error);
    throw error;
  }
};

// ------------------------------------------------------
// Restore user from Firebase Auth (cache works offline)
// ------------------------------------------------------
export const restoreUser = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: "google"
        };
        // Sync with localStorage
        localStorage.setItem("ariseUser", JSON.stringify(userData));
        resolve(userData);
      } else {
        const cachedUser = localStorage.getItem("ariseUser");
        resolve(cachedUser ? JSON.parse(cachedUser) : null);
      }
    });
  });
};

// ------------------------------------------------------
// Sign out (also clears offline cache)
// ------------------------------------------------------
export const logOut = async () => {
  try {
    if (isOnline()) {
      await signOut(auth);
    }
  } catch (error) {
    console.warn("⚠️ Sign-out error (probably offline):", error);
  }
  // Remove localStorage user so offline login is cleared
  localStorage.removeItem('ariseUser');
};

export { auth, db };
