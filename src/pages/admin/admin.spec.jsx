import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderApp, fill, currentPath } from '../../test/helpers';
import { db } from '../../data/db';
import { rawgService } from '../../services/rawgService';

describe('Admin · Productos', () => {
  it('lista los productos y filtra por búsqueda', () => {
    renderApp('/admin/productos', { as: 'admin' });
    expect(document.querySelectorAll('tbody tr').length).toBe(db.games.getAll().length);
    fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: 'zelda' } });
    expect(document.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('crea un producto nuevo (CRUD: crear) y redirige a su ficha', () => {
    const create = spyOn(db.games, 'create').and.callThrough();
    const { container } = renderApp('/admin/productos/nuevo', { as: 'admin' });
    fill(container, 'title', 'Hades');
    fill(container, 'category', 'Indie');
    fill(container, 'platform', 'Nintendo Switch');
    fill(container, 'price', '19990');
    fill(container, 'stock', '12');
    fill(container, 'rating', '4.9');
    fill(container, 'description', 'Escapa del inframundo en este roguelike de acción.');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(create).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Hades', price: 19990, stock: 12 }));
    expect(currentPath(screen)).toBe(`/admin/productos/${create.calls.mostRecent().returnValue.id}`);
    expect(screen.getByRole('heading', { name: 'Hades' })).toBeTruthy();
  });

  it('no guarda si hay errores de validación', () => {
    const create = spyOn(db.games, 'create');
    renderApp('/admin/productos/nuevo', { as: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText('Selecciona una categoría válida.')).toBeTruthy();
  });

  it('impide duplicar un juego en la misma plataforma', () => {
    const { container } = renderApp('/admin/productos/nuevo', { as: 'admin' });
    fill(container, 'title', 'halo infinite');
    fill(container, 'category', 'Shooter');
    fill(container, 'platform', 'Xbox');
    fill(container, 'price', '19990');
    fill(container, 'stock', '1');
    fill(container, 'description', 'Descripción suficientemente larga para validar.');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByRole('alert').textContent).toContain('Ya existe ese juego');
  });

  it('edita un producto existente (CRUD: actualizar) con el formulario precargado', () => {
    const { container } = renderApp('/admin/productos/9/editar', { as: 'admin' });
    expect(container.querySelector('[name="title"]').value).toBe('Gears 5');
    fill(container, 'stock', '40');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(db.games.getById(9).stock).toBe(40);
    expect(currentPath(screen)).toBe('/admin/productos/9');
  });

  it('elimina un producto tras confirmar (CRUD: eliminar)', () => {
    renderApp('/admin/productos', { as: 'admin' });
    fireEvent.click(screen.getByLabelText('Eliminar Celeste'));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(db.games.getById(16)).toBeNull();
    expect(document.querySelector('tbody').textContent).not.toContain('Celeste');
  });

  it('el listado de críticos muestra solo productos con stock ≤ 5', () => {
    renderApp('/admin/productos/criticos', { as: 'admin' });
    const critical = db.games.find(game => game.stock <= 5);
    expect(document.querySelectorAll('tbody tr').length).toBe(critical.length);
  });
});

describe('Admin · Categorías, usuarios y órdenes', () => {
  it('no permite eliminar una categoría en uso', () => {
    renderApp('/admin/categorias', { as: 'admin' });
    expect(screen.getByLabelText('Eliminar Acción').disabled).toBeTrue();
  });

  it('renombrar una categoría actualiza sus productos', () => {
    const { container } = renderApp('/admin/categorias/3/editar', { as: 'admin' });
    fill(container, 'name', 'Rol');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar categoría' }));
    expect(db.games.find(game => game.category === 'Rol').length).toBe(3);
    expect(db.games.find(game => game.category === 'RPG').length).toBe(0);
  });

  it('crea un usuario y muestra su ficha con historial', () => {
    const { container } = renderApp('/admin/usuarios/nuevo', { as: 'admin' });
    fill(container, 'name', 'Pedro');
    fill(container, 'lastName', 'Soto');
    fill(container, 'email', 'pedro@mail.cl');
    fill(container, 'password', '123456');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }));
    expect(screen.getByRole('heading', { name: 'Pedro Soto' })).toBeTruthy();
    expect(screen.getByText('Aún no hay compras registradas.')).toBeTruthy();
  });

  it('el administrador no puede eliminarse a sí mismo', () => {
    renderApp('/admin/usuarios', { as: 'admin' });
    expect(screen.getByLabelText('Eliminar admin@game.com').disabled).toBeTrue();
    expect(screen.getByLabelText('Eliminar user@game.com').disabled).toBeFalse();
  });

  it('filtra órdenes por estado y abre la boleta', () => {
    renderApp('/admin/ordenes', { as: 'admin' });
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'rechazada' } });
    expect(screen.getByText('No hay órdenes registradas.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'all' } });
    fireEvent.click(screen.getAllByRole('link', { name: 'Mostrar boleta' })[0]);
    expect(screen.getByRole('heading', { name: /Boleta LV-/ })).toBeTruthy();
  });

  it('reportes calculan las ventas pagadas', () => {
    renderApp('/admin/reportes', { as: 'admin' });
    expect(screen.getByText('Ventas por plataforma')).toBeTruthy();
    expect(screen.getAllByText(/141\.962/).length).toBeGreaterThan(0);
  });
});

describe('Admin · Dashboard (sincronización RAWG mockeada)', () => {
  it('llama al servicio y notifica el resultado', async () => {
    const sync = spyOn(rawgService, 'syncCovers').and.returnValue(Promise.resolve({ updated: 18, failed: 0, total: 18 }));
    renderApp('/admin', { as: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: /Sincronizar 18 portadas/ }));
    expect(sync).toHaveBeenCalled();
    expect(await screen.findByText('Catálogo sincronizado')).toBeTruthy();
    expect(screen.getByText('18 portadas actualizadas.')).toBeTruthy();
  });

  it('muestra un aviso si la API falla', async () => {
    spyOn(rawgService, 'syncCovers').and.returnValue(Promise.reject(new Error('offline')));
    renderApp('/admin', { as: 'admin' });
    fireEvent.click(screen.getByRole('button', { name: /Sincronizar/ }));
    await waitFor(() => expect(screen.getByText('No se pudo sincronizar')).toBeTruthy());
  });
});
