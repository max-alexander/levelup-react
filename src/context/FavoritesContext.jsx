import { createContext, useContext, useEffect, useState } from 'react';
import { storage, DB_VERSION } from '../data/db';

const KEY = `lv_favorites_${DB_VERSION}`;
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => storage.read(KEY, []));
  useEffect(() => { storage.write(KEY, ids); }, [ids]);

  const value = {
    ids,
    isFavorite: id => ids.includes(id),
    toggle: id => setIds(current => (current.includes(id) ? current.filter(value => value !== id) : [...current, id]))
  };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return context;
}
