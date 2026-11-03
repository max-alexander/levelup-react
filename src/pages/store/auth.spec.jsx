import { screen, fireEvent } from '@testing-library/react';
import { renderApp, fill, currentPath } from '../../test/helpers';
import { authService } from '../../services/authService';
import { db } from '../../data/db';

describe('Login (estado del formulario y mocks)', () => {
  it('el estado del formulario cambia cuando el usuario escribe', () => {
    const { container } = renderApp('/login');
    const email = fill(container, 'email', 'user@game.com');
    const password = fill(container, 'password', '123456');
    expect(email.value).toBe('user@game.com');
    expect(password.value).toBe('123456');
  });

  it('muestra errores de validación y no llama al servicio si el formulario es inválido', () => {
    const login = spyOn(authService, 'login');
    const { container } = renderApp('/login');
    fill(container, 'email', 'correo-malo');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it('el error de validación desaparece cuando se corrige el campo', () => {
    const { container } = renderApp('/login');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    fill(container, 'email', 'a');
    expect(screen.queryByText('El correo es obligatorio.')).toBeNull();
  });

  it('muestra el mensaje de error que devuelve el servicio (mock que lanza excepción)', () => {
    spyOn(authService, 'login').and.throwError('Correo o contraseña incorrectos.');
    const { container } = renderApp('/login');
    expect(screen.queryByRole('alert')).toBeNull();
    fill(container, 'email', 'user@game.com');
    fill(container, 'password', 'incorrecta');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByRole('alert').textContent).toContain('Correo o contraseña incorrectos.');
  });

  it('con credenciales válidas redirige al admin según el rol (mock que resuelve)', () => {
    const login = spyOn(authService, 'login').and.returnValue({ id: 1, name: 'Admin', lastName: 'X', email: 'admin@game.com', role: 'admin' });
    spyOn(authService, 'currentUser').and.returnValue({ id: 1, name: 'Admin', lastName: 'X', email: 'admin@game.com', role: 'admin' });
    const { container } = renderApp('/login');
    fill(container, 'email', 'admin@game.com');
    fill(container, 'password', '123456');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(login).toHaveBeenCalledOnceWith('admin@game.com', '123456');
    expect(currentPath(screen)).toBe('/admin');
  });
});

describe('Registro de usuario', () => {
  const fillValid = container => {
    fill(container, 'name', 'Ana');
    fill(container, 'lastName', 'Pérez');
    fill(container, 'email', 'ana@mail.cl');
    fill(container, 'password', 'secreto1');
    fill(container, 'confirmPassword', 'secreto1');
    fill(container, 'region', 'Biobío');
    fill(container, 'comuna', 'Concepción');
    fireEvent.click(container.querySelector('[name="terms"]'));
  };

  it('valida contraseñas distintas y términos no aceptados', () => {
    const { container } = renderApp('/registro');
    fill(container, 'password', 'secreto1');
    fill(container, 'confirmPassword', 'otro');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(screen.getByText('Debes aceptar los términos.')).toBeTruthy();
  });

  it('la lista de comunas depende de la región seleccionada', () => {
    const { container } = renderApp('/registro');
    const comuna = container.querySelector('[name="comuna"]');
    expect(comuna.disabled).toBeTrue();
    fill(container, 'region', 'Valparaíso');
    expect(comuna.disabled).toBeFalse();
    expect([...comuna.options].map(o => o.value)).toContain('Viña del Mar');
  });

  it('crea la cuenta, inicia sesión y vuelve al inicio', () => {
    const { container } = renderApp('/registro');
    fillValid(container);
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(currentPath(screen)).toBe('/');
    expect(db.users.getAll().some(user => user.email === 'ana@mail.cl')).toBeTrue();
    expect(screen.getByRole('button', { name: /Ana/ })).toBeTruthy();
  });

  it('muestra error si el correo ya existe', () => {
    const { container } = renderApp('/registro');
    fillValid(container);
    fill(container, 'email', 'user@game.com');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByRole('alert').textContent).toContain('ya está registrado');
  });
});
