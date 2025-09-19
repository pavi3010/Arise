// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { checkUserExists } from '../firebase'; // Import your function to get user data

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // <-- Add state for profile data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await checkUserExists(user.uid); // Fetch profile from Firestore
        setUserProfile(profile);
        // Sync localStorage just once on login for role switching, but don't rely on it elsewhere
        if (profile) {
          localStorage.setItem('ariseUser', JSON.stringify(profile));
        }
      } else {
        setUserProfile(null); // Clear profile on logout
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile, // <-- Expose profile in context
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}