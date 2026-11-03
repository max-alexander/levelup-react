import { useEffect, useState } from 'react';
import { subscribe } from '../data/db';

/**
 * Conecta un componente con una colección de la BD simulada.
 * Cada create/update/remove notifica a los suscriptores y el componente se vuelve a renderizar.
 */
export function useCollection(collection) {
  const [items, setItems] = useState(() => collection.getAll());

  useEffect(() => {
    setItems(collection.getAll());
    return subscribe(name => {
      if (name === collection.name) setItems(collection.getAll());
    });
  }, [collection]);

  return items;
}
