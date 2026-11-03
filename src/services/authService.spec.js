import { authService } from './authService';
import { db } from '../data/db';

describe('authService', () => {
  it('inicia sesión sin exponer la contraseña y sin importar mayúsculas en el correo', () => {
    const user = authService.login('ADMIN@game.com', '123456');
    expect(user.role).toBe('admin');
    expect(user.password).toBeUndefined();
    expect(authService.currentUser().email).toBe('admin@game.com');
  });

  it('rechaza credenciales incorrectas', () => {
    expect(() => authService.login('admin@game.com', 'malo')).toThrowError('Correo o contraseña incorrectos.');
    expect(authService.currentUser()).toBeNull();
  });

  it('registra usuarios nuevos como clientes y bloquea correos duplicados', () => {
    const user = authService.register({ name: 'Ana', lastName: 'Pérez', email: 'Ana@Mail.cl', password: '123456', region: 'Biobío', comuna: 'Concepción' });
    expect(user.role).toBe('usuario');
    expect(db.users.getById(user.id).email).toBe('ana@mail.cl');
    expect(() => authService.register({ name: 'Otra', lastName: 'X', email: 'ana@mail.cl', password: '123456' })).toThrowError(/ya está registrado/);
  });

  it('logout limpia la sesión y currentUser refleja cambios del admin', () => {
    const user = authService.login('user@game.com', '123456');
    db.users.update(user.id, { name: 'Renombrado' });
    expect(authService.currentUser().name).toBe('Renombrado');
    authService.logout();
    expect(authService.currentUser()).toBeNull();
  });

  it('updateProfile valida que el correo no pertenezca a otro usuario', () => {
    authService.login('user@game.com', '123456');
    expect(() => authService.updateProfile(2, { email: 'admin@game.com' })).toThrowError(/ya está registrado/);
    expect(authService.updateProfile(2, { name: 'Nuevo' }).name).toBe('Nuevo');
  });
});
