import { screen, fireEvent, within } from '@testing-library/react';
import { renderApp, fill, currentPath } from '../../test/helpers';
import { paymentGateway } from '../../services/orderService';
import { db } from '../../data/db';
import { PAGE_SIZE } from './Catalog';

const addFromDetail = (id, times = 1) => {
  const detail = document.querySelector('.detail-content');
  for (let i = 0; i < times; i++) fireEvent.click(within(detail).getByRole('button', { name: /Agregar al carrito/ }));
};

describe('Catálogo (filtros y paginación)', () => {
  it('pagina los productos y permite cambiar de página', () => {
    renderApp('/productos');
    expect(screen.getAllByTestId('game-card').length).toBe(PAGE_SIZE);
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getAllByTestId('game-card').length).toBe(Math.min(PAGE_SIZE, db.games.getAll().length - PAGE_SIZE));
    expect(screen.getByRole('button', { name: '2' }).getAttribute('aria-current')).toBe('page');
  });

  it('filtra por plataforma y limpia los filtros', () => {
    renderApp('/productos');
    fireEvent.change(screen.getByLabelText('Plataforma'), { target: { value: 'Xbox' } });
    const cards = screen.getAllByTestId('game-card');
    cards.forEach(card => expect(within(card).getByText('Xbox')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: /Limpiar/ }));
    expect(screen.getAllByTestId('game-card').length).toBe(PAGE_SIZE);
  });

  it('la vista de ofertas muestra solo productos con descuento', () => {
    renderApp('/ofertas');
    const offers = db.games.getAll().filter(game => game.discount > 0);
    expect(screen.getAllByTestId('game-card').length).toBe(offers.length);
  });

  it('la vista de categoría muestra solo los juegos de esa categoría', () => {
    renderApp('/categorias/RPG');
    expect(screen.getByRole('heading', { name: 'RPG' })).toBeTruthy();
    expect(screen.getAllByTestId('game-card').length).toBe(db.games.find(game => game.category === 'RPG').length);
  });
});

describe('Carrito', () => {
  it('suma, resta, aplica cupón y recalcula el total', () => {
    renderApp('/productos/1');
    addFromDetail(1);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    expect(screen.getAllByTestId('cart-item').length).toBe(1);
    fireEvent.click(screen.getByLabelText('Sumar God of War Ragnarök'));
    expect(screen.getByTestId('cart-total').textContent.replace(/\s/g, '')).toBe('$119.980');
    fireEvent.change(screen.getByLabelText('Código de descuento'), { target: { value: 'LEVEL10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByText('Cupón aplicado: 10% de descuento.')).toBeTruthy();
    expect(screen.getByTestId('cart-total').textContent.replace(/\s/g, '')).toBe('$107.982');
  });

  it('muestra error con un cupón inválido y vacía el carrito tras confirmar', () => {
    renderApp('/productos/2');
    addFromDetail(2);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.change(screen.getByLabelText('Código de descuento'), { target: { value: 'NOVALE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByRole('alert').textContent).toContain('Código no válido.');
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar' }));
    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
  });
});

describe('Checkout (mock de la pasarela de pago)', () => {
  const fillPayment = container => {
    fill(container, 'cardName', 'Usuario Cliente');
    fill(container, 'cardNumber', '4111111111111111');
    fill(container, 'cardExpiry', '1230');
    fill(container, 'cardCvv', '123');
  };

  it('autocompleta los datos del cliente si hay sesión iniciada', () => {
    renderApp('/productos/1', { as: 'user' });
    addFromDetail(1);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprar ahora' }));
    expect(currentPath(screen)).toBe('/checkout');
    const form = document.querySelector('form.checkout-card');
    expect(form.querySelector('[name="email"]').value).toBe('user@game.com');
    expect(form.querySelector('[name="comuna"]').value).toBe('Ñuñoa');
    expect(form.querySelector('[name="cardNumber"]').value).toBe('');
  });

  it('aplica máscaras a la tarjeta y muestra errores si faltan datos', () => {
    renderApp('/productos/1');
    addFromDetail(1);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprar ahora' }));
    const form = document.querySelector('form.checkout-card');
    expect(fill(form, 'cardNumber', '4111abc111111111111111').value).toBe('4111 1111 1111 1111');
    expect(fill(form, 'cardExpiry', '1230').value).toBe('12/30');
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
    expect(screen.getByText('Revisa los campos marcados en rojo.')).toBeTruthy();
    expect(screen.getByText('Ingresa calle y número (mín. 5 caracteres).')).toBeTruthy();
  });

  it('pago aprobado → vista de compra exitosa, carrito vacío y stock descontado', () => {
    const charge = spyOn(paymentGateway, 'charge').and.returnValue({ approved: true, authorization: 'AUT-123' });
    renderApp('/productos/1', { as: 'user' });
    addFromDetail(1, 2);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprar ahora' }));
    fillPayment(document.querySelector('form.checkout-card'));
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(charge).toHaveBeenCalledTimes(1);
    expect(currentPath(screen)).toMatch(/^\/compra\/exitosa\/\d+$/);
    expect(screen.getByText(/Se ha realizado la compra/)).toBeTruthy();
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(db.games.getById(1).stock).toBe(12);
  });

  it('pago rechazado → vista de error y "volver a realizar el pago" conserva los datos', () => {
    spyOn(paymentGateway, 'charge').and.returnValue({ approved: false, message: 'Fondos insuficientes.' });
    renderApp('/productos/1', { as: 'user' });
    addFromDetail(1);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprar ahora' }));
    fillPayment(document.querySelector('form.checkout-card'));
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(currentPath(screen)).toMatch(/^\/compra\/error\/\d+$/);
    expect(screen.getByText(/No se pudo realizar el pago/)).toBeTruthy();
    expect(screen.getByText(/Fondos insuficientes/)).toBeTruthy();
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
    expect(db.games.getById(1).stock).toBe(14);

    fireEvent.click(screen.getByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }));
    expect(currentPath(screen)).toMatch(/^\/checkout\?reintento=\d+$/);
    expect(document.querySelector('[name="street"]').value).toBe('Los Crisantemos 742');
  });
});
