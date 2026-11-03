import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { db, subscribe } from '../data/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.currentUser());

  // Si un admin edita/elimina al usuario en sesión, la sesión se refresca.
  useEffect(() => subscribe(name => {
    if (name === db.users.name) setUser(authService.currentUser());
  }), []);

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    login: (email, password) => {
      const logged = authService.login(email, password);
      setUser(logged);
      return logged;
    },
    register: data => {
      const created = authService.register(data);
      setUser(created);
      return created;
    },
    logout: () => {
      authService.logout();
      setUser(null);
    },
    updateProfile: changes => {
      const updated = authService.updateProfile(user.id, changes);
      setUser(updated);
      return updated;
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
