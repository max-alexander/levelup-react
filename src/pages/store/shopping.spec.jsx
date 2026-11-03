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

describe('Checkout por pasos (stepper + mock de la pasarela de pago)', () => {
  const form = () => document.querySelector('form.checkout-card');
  const goToCheckout = (as, times = 1) => {
    renderApp('/productos/1', as ? { as } : undefined);
    addFromDetail(1, times);
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprar ahora' }));
  };
  const continuar = () => fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
  const currentStep = () => document.querySelector('[aria-current="step"]').textContent;
  const fillPayment = () => {
    fill(form(), 'cardName', 'Usuario Cliente');
    fill(form(), 'cardNumber', '4111111111111111');
    fill(form(), 'cardExpiry', '1230');
    fill(form(), 'cardCvv', '123');
  };

  it('empieza en el paso 1 y autocompleta los datos si hay sesión', () => {
    goToCheckout('user');
    expect(currentPath(screen)).toBe('/checkout');
    expect(currentStep()).toContain('Datos');
    expect(form().querySelector('[name="email"]').value).toBe('user@game.com');
    expect(form().querySelector('[name="cardNumber"]')).toBeNull(); // el paso de pago aún no se muestra
    expect(screen.getByTestId('checkout-total').textContent.replace(/\s/g, '')).toBe('$59.990');
  });

  it('no avanza de paso si los campos del paso actual son inválidos', () => {
    goToCheckout();
    continuar();
    expect(currentStep()).toContain('Datos');
    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    // Solo se validan los campos del paso visible: no hay errores del paso de envío.
    expect(screen.queryByText('Ingresa calle y número (mín. 5 caracteres).')).toBeNull();
  });

  it('avanza con datos válidos, vuelve atrás sin perder lo escrito y permite saltar a un paso completado', () => {
    goToCheckout();
    fill(form(), 'name', 'Ana');
    fill(form(), 'lastName', 'Pérez');
    fill(form(), 'email', 'ana@mail.cl');
    continuar();
    expect(currentStep()).toContain('Envío');
    fireEvent.click(screen.getByRole('button', { name: /Atrás/ }));
    expect(form().querySelector('[name="name"]').value).toBe('Ana');
    continuar();
    fill(form(), 'street', 'Av. Siempre Viva 742');
    fill(form(), 'region', 'Biobío');
    fill(form(), 'comuna', 'Concepción');
    continuar();
    expect(currentStep()).toContain('Pago');
    expect(document.querySelector('.checkout-review').textContent).toContain('Av. Siempre Viva 742');
    fireEvent.click(screen.getByRole('button', { name: 'Volver al paso 1: Datos' }));
    expect(currentStep()).toContain('Datos');
  });

  it('aplica máscaras a la tarjeta y exige datos de pago válidos', () => {
    goToCheckout('user');
    continuar();
    continuar();
    expect(fill(form(), 'cardNumber', '4111abc111111111111111').value).toBe('4111 1111 1111 1111');
    expect(fill(form(), 'cardExpiry', '1230').value).toBe('12/30');
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
    expect(screen.getByText('Revisa los campos marcados en rojo.')).toBeTruthy();
    expect(screen.getByText('Ingresa el nombre del titular.')).toBeTruthy();
  });

  it('pago aprobado → vista de compra exitosa, carrito vacío y stock descontado', () => {
    const charge = spyOn(paymentGateway, 'charge').and.returnValue({ approved: true, authorization: 'AUT-123' });
    goToCheckout('user', 2);
    continuar();
    continuar();
    fillPayment();
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(charge).toHaveBeenCalledTimes(1);
    expect(currentPath(screen)).toMatch(/^\/compra\/exitosa\/\d+$/);
    expect(screen.getByText(/Se ha realizado la compra/)).toBeTruthy();
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(db.games.getById(1).stock).toBe(12);
  });

  it('pago rechazado → vista de error; reintentar abre directo el paso de pago con los datos guardados', () => {
    spyOn(paymentGateway, 'charge').and.returnValue({ approved: false, message: 'Fondos insuficientes.' });
    goToCheckout('user');
    continuar();
    continuar();
    fillPayment();
    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));

    expect(currentPath(screen)).toMatch(/^\/compra\/error\/\d+$/);
    expect(screen.getByText(/No se pudo realizar el pago/)).toBeTruthy();
    expect(screen.getByText(/Fondos insuficientes/)).toBeTruthy();
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
    expect(db.games.getById(1).stock).toBe(14);

    fireEvent.click(screen.getByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }));
    expect(currentPath(screen)).toMatch(/^\/checkout\?reintento=\d+$/);
    expect(currentStep()).toContain('Pago');
    expect(document.querySelector('.checkout-review').textContent).toContain('Los Crisantemos 742');
  });
});
