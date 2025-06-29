import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebase";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const auth = getAuth(app);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);
  return <AuthContext.Provider value={{ user, signOut: () => signOut(getAuth(app)) }}>{children}</AuthContext.Provider>;
}
