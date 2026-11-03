// Fuente de datos simulada (equivalente a una base de datos) con operaciones CRUD.
// Persiste en localStorage y notifica a los componentes suscritos cada vez que cambia,
// de modo que la interfaz se actualiza en tiempo real (ver hooks/useCollection).
import { SEED_CATEGORIES, SEED_GAMES, SEED_ORDERS, SEED_USERS } from './seed';

// Cambiar la versión fuerza a recargar los datos semilla en navegadores con datos antiguos.
export const DB_VERSION = 'v3';
const listeners = new Set();

export const storage = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

const clone = value => JSON.parse(JSON.stringify(value));

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(name) {
  listeners.forEach(listener => listener(name));
}

export function createCollection(name, seed) {
  const key = `lv_${name}_${DB_VERSION}`;

  const load = () => storage.read(key, null) ?? clone(seed);
  const save = items => {
    storage.write(key, items);
    notify(name);
    return items;
  };
  const nextId = items => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

  return {
    name,
    key,
    /** Leer: todos los registros (copia, para no mutar el "almacenamiento"). */
    getAll() {
      return clone(load());
    },
    /** Leer: un registro por id. */
    getById(id) {
      return this.getAll().find(item => String(item.id) === String(id)) ?? null;
    },
    /** Leer: registros que cumplen un predicado. */
    find(predicate) {
      return this.getAll().filter(predicate);
    },
    /** Crear: asigna id autoincremental si no viene uno. */
    create(data) {
      const items = load();
      const record = { ...clone(data), id: data.id ?? nextId(items) };
      if (items.some(item => String(item.id) === String(record.id))) {
        throw new Error(`Ya existe un registro con id ${record.id} en ${name}`);
      }
      save([...items, record]);
      return clone(record);
    },
    /** Actualizar: mezcla los cambios con el registro existente. */
    update(id, changes) {
      const items = load();
      const index = items.findIndex(item => String(item.id) === String(id));
      if (index < 0) throw new Error(`No existe el registro ${id} en ${name}`);
      items[index] = { ...items[index], ...clone(changes), id: items[index].id };
      save(items);
      return clone(items[index]);
    },
    /** Eliminar: devuelve true si se eliminó. */
    remove(id) {
      const items = load();
      const filtered = items.filter(item => String(item.id) !== String(id));
      if (filtered.length === items.length) return false;
      save(filtered);
      return true;
    },
    /** Reemplaza la colección completa (usado por la sincronización con RAWG). */
    replaceAll(items) {
      save(clone(items));
    },
    reset() {
      storage.remove(key);
      notify(name);
    }
  };
}

export const db = {
  games: createCollection('games', SEED_GAMES),
  categories: createCollection('categories', SEED_CATEGORIES),
  users: createCollection('users', SEED_USERS),
  orders: createCollection('orders', SEED_ORDERS)
};

export function resetDatabase() {
  Object.values(db).forEach(collection => collection.reset());
}
