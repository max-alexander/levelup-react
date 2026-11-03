import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderApp, renderAdmin, currentPath } from '../../test/helpers';

describe('Navegación y rutas protegidas', () => {
  it('el navbar muestra login/registro sin sesión y el contador del carrito en 0', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeTruthy();
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.queryByText('Administración')).toBeNull();
  });

  it('el contador del carrito se actualiza al agregar un producto', () => {
    renderApp('/productos/1');
    fireEvent.click(within(document.querySelector('.detail-content')).getByRole('button', { name: /Agregar al carrito/ }));
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
  });

  it('el buscador del navbar navega al catálogo con el término (Enter sin sugerencia elegida)', () => {
    renderApp('/');
    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir búsqueda' })[0]);
    const input = screen.getByRole('combobox', { name: 'Buscar en la tienda' });
    fireEvent.change(input, { target: { value: 'halo' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(currentPath(screen)).toBe('/productos?q=halo');
    expect(screen.getByRole('heading', { name: 'Halo Infinite' })).toBeTruthy();
  });

  it('el administrador ve el acceso al panel en el menú de usuario', () => {
    renderApp('/', { as: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: /Administrador/ }));
    expect(screen.getByRole('link', { name: /Administración/ })).toBeTruthy();
  });

  it('redirige a /login si se intenta entrar al admin sin sesión', () => {
    renderApp('/admin');
    expect(currentPath(screen)).toBe('/login');
  });

  it('un cliente no puede entrar al panel de administración', () => {
    renderApp('/admin/productos', { as: 'user' });
    expect(currentPath(screen)).toBe('/');
  });

  it('el administrador accede al dashboard (panel cargado con React.lazy)', async () => {
    await renderAdmin('/admin');
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Compras')).toBeTruthy();
  });

  it('cerrar sesión vuelve a mostrar el botón de ingreso', async () => {
    renderApp('/', { as: 'user' });
    fireEvent.click(screen.getByRole('button', { name: /Usuario/ }));
    fireEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy());
  });

  it('rutas inexistentes muestran la página 404', () => {
    renderApp('/no-existe');
    expect(screen.getByText('Página no encontrada')).toBeTruthy();
  });
});
