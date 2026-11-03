import { screen, fireEvent, within } from '@testing-library/react';
import { renderApp, fill, currentPath } from '../../test/helpers';
import { db } from '../../data/db';
import { BLOG_POSTS } from '../../data/seed';

describe('Vistas de contenido (blog, contacto, nosotros)', () => {
  it('el blog lista todos los artículos y abre su detalle', () => {
    renderApp('/blogs');
    expect(screen.getAllByRole('link', { name: 'Leer más' }).length).toBe(BLOG_POSTS.length);
    fireEvent.click(screen.getAllByRole('link', { name: 'Leer más' })[1]);
    expect(currentPath(screen)).toBe(`/blogs/${BLOG_POSTS[1].slug}`);
    expect(screen.getByRole('heading', { name: BLOG_POSTS[1].title })).toBeTruthy();
  });

  it('un artículo inexistente muestra un estado vacío', () => {
    renderApp('/blogs/no-existe');
    expect(screen.getByText('Artículo no encontrado')).toBeTruthy();
  });

  it('el formulario de contacto valida y confirma el envío', () => {
    const { container } = renderApp('/contacto');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(screen.getByText('El mensaje debe tener entre 10 y 500 caracteres.')).toBeTruthy();
    fill(container, 'name', 'Ana');
    fill(container, 'email', 'ana@mail.cl');
    fill(container, 'message', '¿Tienen stock de Hades para Switch?');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
    expect(screen.getByRole('alert').textContent).toContain('Gracias Ana');
    expect(container.querySelector('[name="message"]').value).toBe('');
  });

  it('nosotros muestra misión y visión', () => {
    renderApp('/nosotros');
    expect(screen.getByText('Nuestra misión')).toBeTruthy();
    expect(screen.getByText('Nuestra visión')).toBeTruthy();
  });
});

describe('Favoritos y Mi cuenta', () => {
  it('marcar un favorito lo muestra en la vista de favoritos', () => {
    renderApp('/productos');
    const card = screen.getAllByTestId('game-card')[0];
    const title = within(card).getByRole('heading').textContent;
    fireEvent.click(within(card).getByRole('button', { name: 'Agregar a favoritos' }));
    fireEvent.click(screen.getByRole('link', { name: 'Favoritos' }));
    expect(screen.getAllByTestId('game-card').length).toBe(1);
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
  });

  it('no permite agregar más unidades que el stock disponible', () => {
    renderApp('/productos/16', { as: 'user' }); // Celeste: stock 2
    const detail = document.querySelector('.detail-content');
    const add = () => fireEvent.click(within(detail).getByRole('button', { name: /Agregar al carrito|Sin stock/ }));
    add();
    add();
    expect(screen.getByTestId('cart-count').textContent).toBe('2');
    expect(within(detail).getByRole('button', { name: /Sin stock disponible/ }).disabled).toBeTrue();
  });

  it('Mi cuenta muestra el historial y guarda cambios del perfil', () => {
    const { container } = renderApp('/mi-cuenta', { as: 'user' });
    expect(screen.getByText('Orden LV-20261001')).toBeTruthy();
    fill(container, 'name', 'Carla');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByRole('alert').textContent).toContain('Tus cambios fueron guardados.');
    expect(db.users.getById(2).name).toBe('Carla');
  });

  it('Mi cuenta muestra error si el correo ya pertenece a otro usuario', () => {
    const { container } = renderApp('/mi-cuenta', { as: 'user' });
    fill(container, 'email', 'admin@game.com');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByRole('alert').textContent).toContain('ya está registrado');
  });

  it('Mi cuenta exige sesión', () => {
    renderApp('/mi-cuenta');
    expect(currentPath(screen)).toBe('/login');
  });
});
