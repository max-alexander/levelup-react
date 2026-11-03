import { cartReducer, initialCartState } from './CartContext';

describe('cartReducer (gestión del estado del carrito)', () => {
  it('agrega un producto nuevo con cantidad 1', () => {
    const state = cartReducer(initialCartState, { type: 'add', id: 7, stock: 3 });
    expect(state.lines).toEqual([{ id: 7, quantity: 1 }]);
  });

  it('suma cantidades sin superar el stock disponible', () => {
    let state = cartReducer(initialCartState, { type: 'add', id: 7, stock: 3, quantity: 2 });
    state = cartReducer(state, { type: 'add', id: 7, stock: 3, quantity: 5 });
    expect(state.lines[0].quantity).toBe(3);
    const same = cartReducer(state, { type: 'add', id: 7, stock: 3 });
    expect(same).toBe(state); // sin cambios → misma referencia
  });

  it('no agrega productos sin stock', () => {
    expect(cartReducer(initialCartState, { type: 'add', id: 9, stock: 0 })).toBe(initialCartState);
  });

  it('setQuantity actualiza, limita al stock y elimina si llega a 0', () => {
    const start = { lines: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }], coupon: null };
    expect(cartReducer(start, { type: 'setQuantity', id: 1, quantity: 10, stock: 4 }).lines[0].quantity).toBe(4);
    expect(cartReducer(start, { type: 'setQuantity', id: 1, quantity: 0 }).lines).toEqual([{ id: 2, quantity: 1 }]);
  });

  it('aplica solo cupones válidos y no muta el estado anterior', () => {
    const valid = cartReducer(initialCartState, { type: 'applyCoupon', code: ' level10 ' });
    expect(valid.coupon).toBe('LEVEL10');
    expect(initialCartState.coupon).toBeNull();
    expect(cartReducer(valid, { type: 'applyCoupon', code: 'FALSO' }).coupon).toBeNull();
  });

  it('remove y clear vacían el carrito; acciones desconocidas no cambian nada', () => {
    const start = { lines: [{ id: 1, quantity: 2 }], coupon: 'LEVEL10' };
    expect(cartReducer(start, { type: 'remove', id: 1 }).lines).toEqual([]);
    expect(cartReducer(start, { type: 'clear' })).toEqual(initialCartState);
    expect(cartReducer(start, { type: 'otra' })).toBe(start);
  });
});
