// Autenticación simulada sobre la colección de usuarios.
// Se expone como objeto para poder reemplazar sus métodos con spies (mocks) en las pruebas.
import { db, storage, DB_VERSION } from '../data/db';
import { sanitizeText } from '../utils/format';

const SESSION_KEY = `lv_session_${DB_VERSION}`;

const publicUser = user => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const authService = {
  login(email, password) {
    const normalized = String(email ?? '').trim().toLowerCase();
    const user = db.users.getAll().find(u => u.email.toLowerCase() === normalized && u.password === password);
    if (!user) throw new Error('Correo o contraseña incorrectos.');
    const session = publicUser(user);
    storage.write(SESSION_KEY, session);
    return session;
  },

  register({ name, lastName, email, password, region, comuna, street = '' }) {
    const normalized = String(email).trim().toLowerCase();
    if (db.users.getAll().some(u => u.email.toLowerCase() === normalized)) {
      throw new Error('El correo ya está registrado.');
    }
    const user = db.users.create({
      name: sanitizeText(name), lastName: sanitizeText(lastName), email: normalized, password, role: 'usuario',
      address: { street: sanitizeText(street), apartment: '', region, comuna, notes: '' }
    });
    const session = publicUser(user);
    storage.write(SESSION_KEY, session);
    return session;
  },

  logout() {
    storage.remove(SESSION_KEY);
  },

  currentUser() {
    const session = storage.read(SESSION_KEY, null);
    if (!session) return null;
    // Se relee desde la "BD" para reflejar cambios hechos por el administrador.
    return publicUser(db.users.getById(session.id));
  },

  updateProfile(id, changes) {
    const email = String(changes.email ?? '').trim().toLowerCase();
    if (email && db.users.getAll().some(u => u.email.toLowerCase() === email && u.id !== id)) {
      throw new Error('El correo ya está registrado.');
    }
    const updated = publicUser(db.users.update(id, { ...changes, ...(email ? { email } : {}) }));
    storage.write(SESSION_KEY, updated);
    return updated;
  }
};
