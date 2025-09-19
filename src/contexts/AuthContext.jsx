import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Let Firebase's onAuthStateChanged manage the user session.
    // It automatically handles persisted users from localStorage/IndexedDB.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // This will be the Firebase user object or null
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}