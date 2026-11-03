import { orderService, paymentGateway, calculateTotals, buildOrderItems, DECLINED_CARD } from './orderService';
import { db } from '../data/db';

const customer = { name: 'Ana', lastName: 'Pérez', email: 'ana@mail.cl' };
const address = { street: 'Los Crisantemos 742', apartment: '', region: 'Región Metropolitana', comuna: 'Ñuñoa', notes: '' };

describe('orderService (proceso de compra)', () => {
  it('calcula subtotal, cupón y total', () => {
    expect(calculateTotals([{ price: 10000, quantity: 2 }, { price: 5000, quantity: 1 }])).toEqual({ subtotal: 25000, couponDiscount: 0, total: 25000 });
    expect(calculateTotals([{ price: 10000, quantity: 1 }], 'LEVEL10')).toEqual({ subtotal: 10000, couponDiscount: 1000, total: 9000 });
  });

  it('construye las líneas con el precio en oferta y valida stock', () => {
    const [line] = buildOrderItems([{ id: 3, quantity: 2 }]); // Horizon: 44990 con 25% dcto
    expect(line.price).toBe(33743);
    expect(() => buildOrderItems([{ id: 3, quantity: 50 }])).toThrowError(/stock suficiente/);
    expect(() => buildOrderItems([{ id: 999, quantity: 1 }])).toThrowError(/no está disponible/);
  });

  it('pago aprobado: registra la orden y descuenta stock (pasarela mockeada)', () => {
    const charge = spyOn(paymentGateway, 'charge').and.returnValue({ approved: true, authorization: 'AUT-TEST' });
    const order = orderService.checkout({ cart: [{ id: 1, quantity: 2 }], customer, address, payment: { cardNumber: '4111111111111111' }, userId: 2 });
    expect(charge).toHaveBeenCalledOnceWith({ cardNumber: '4111111111111111' });
    expect(order.status).toBe('pagada');
    expect(order.authorization).toBe('AUT-TEST');
    expect(order.total).toBe(119980);
    expect(db.games.getById(1).stock).toBe(12);
    expect(orderService.byUser(2)[0].id).toBe(order.id);
  });

  it('pago rechazado: registra la orden como rechazada y NO descuenta stock', () => {
    spyOn(paymentGateway, 'charge').and.returnValue({ approved: false, message: 'Rechazada' });
    const order = orderService.checkout({ cart: [{ id: 1, quantity: 1 }], customer, address, payment: { cardNumber: '1' } });
    expect(order.status).toBe('rechazada');
    expect(db.games.getById(1).stock).toBe(14);
  });

  it('reintento de pago reutiliza la misma orden', () => {
    spyOn(paymentGateway, 'charge').and.returnValues({ approved: false, message: 'x' }, { approved: true, authorization: 'ok' });
    const failed = orderService.checkout({ cart: [{ id: 1, quantity: 1 }], customer, address, payment: {} });
    const total = db.orders.getAll().length;
    const retried = orderService.checkout({ cart: [{ id: 1, quantity: 1 }], customer, address, payment: {}, retryOrderId: failed.id });
    expect(retried.id).toBe(failed.id);
    expect(retried.status).toBe('pagada');
    expect(db.orders.getAll().length).toBe(total);
  });

  it('la pasarela simulada rechaza la tarjeta de prueba', () => {
    expect(paymentGateway.charge({ cardNumber: DECLINED_CARD }).approved).toBeFalse();
    expect(paymentGateway.charge({ cardNumber: '4111 1111 1111 1111' }).approved).toBeTrue();
    expect(() => orderService.checkout({ cart: [], customer, address, payment: {} })).toThrowError('El carrito está vacío.');
  });
});
