// Proceso de compra: valida stock, simula la pasarela de pago y registra la orden.
import { db } from '../data/db';
import { finalPrice } from '../utils/format';

/** Tarjeta de prueba que la pasarela simulada siempre rechaza (similar a las test cards de Stripe). */
export const DECLINED_CARD = '4000000000000002';

export const COUPONS = { LEVEL10: 0.1 };

export function calculateTotals(items, coupon = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const rate = COUPONS[coupon] ?? 0;
  const couponDiscount = Math.round(subtotal * rate);
  return { subtotal, couponDiscount, total: subtotal - couponDiscount };
}

/** Convierte el carrito ({id, quantity}) en líneas de orden con el precio vigente. */
export function buildOrderItems(cart, games = db.games.getAll()) {
  return cart.map(line => {
    const game = games.find(g => g.id === line.id);
    if (!game) throw new Error('Uno de los productos ya no está disponible.');
    if (game.stock < line.quantity) throw new Error(`${game.title} no tiene stock suficiente (quedan ${game.stock}).`);
    return { id: game.id, title: game.title, image: game.image, platform: game.platform, price: finalPrice(game), quantity: line.quantity };
  });
}

export const paymentGateway = {
  /** Simula la respuesta de la pasarela. Se espía/mockea en las pruebas. */
  charge({ cardNumber }) {
    const digits = String(cardNumber).replace(/\D/g, '');
    return digits === DECLINED_CARD
      ? { approved: false, message: 'La tarjeta fue rechazada por el emisor.' }
      : { approved: true, authorization: `AUT-${Date.now().toString().slice(-6)}` };
  }
};

export const orderService = {
  checkout({ cart, coupon, customer, address, payment, userId = null, retryOrderId = null }) {
    if (!cart?.length) throw new Error('El carrito está vacío.');
    const items = buildOrderItems(cart);
    const totals = calculateTotals(items, coupon);
    const result = paymentGateway.charge(payment);
    const status = result.approved ? 'pagada' : 'rechazada';
    const base = {
      userId, customer, address, items, ...totals, status, date: new Date().toISOString(),
      paymentMessage: result.message ?? 'Pago aprobado', authorization: result.authorization ?? null
    };

    const order = retryOrderId && db.orders.getById(retryOrderId)
      ? db.orders.update(retryOrderId, base)
      : db.orders.create({ ...base, code: `LV-${Date.now().toString().slice(-8)}` });

    if (result.approved) {
      items.forEach(item => {
        const game = db.games.getById(item.id);
        db.games.update(item.id, { stock: game.stock - item.quantity });
      });
    }
    return order;
  },

  byUser(userId) {
    return db.orders.find(order => order.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};
