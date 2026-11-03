import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { db, storage, DB_VERSION } from '../data/db';
import { useCollection } from '../hooks/useCollection';
import { finalPrice } from '../utils/format';
import { calculateTotals, COUPONS } from '../services/orderService';

const CART_KEY = `lv_cart_${DB_VERSION}`;
export const initialCartState = { lines: [], coupon: null };

/**
 * Reducer puro del carrito: cada acción produce un nuevo estado sin mutar el anterior.
 * lines = [{ id, quantity }]; el precio y el stock se leen siempre desde la BD.
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { id, stock, quantity = 1 } = action;
      const current = state.lines.find(line => line.id === id)?.quantity ?? 0;
      const next = Math.min(stock, current + quantity);
      if (next <= 0 || next === current) return state;
      return current
        ? { ...state, lines: state.lines.map(line => (line.id === id ? { ...line, quantity: next } : line)) }
        : { ...state, lines: [...state.lines, { id, quantity: next }] };
    }
    case 'setQuantity': {
      const quantity = Math.min(action.stock ?? Infinity, Math.floor(action.quantity));
      if (quantity <= 0) return { ...state, lines: state.lines.filter(line => line.id !== action.id) };
      return { ...state, lines: state.lines.map(line => (line.id === action.id ? { ...line, quantity } : line)) };
    }
    case 'remove':
      return { ...state, lines: state.lines.filter(line => line.id !== action.id) };
    case 'applyCoupon': {
      const code = String(action.code ?? '').trim().toUpperCase();
      return { ...state, coupon: COUPONS[code] ? code : null };
    }
    case 'clear':
      return initialCartState;
    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const games = useCollection(db.games);
  const [state, dispatch] = useReducer(cartReducer, undefined, () => storage.read(CART_KEY, initialCartState));

  useEffect(() => { storage.write(CART_KEY, state); }, [state]);

  const items = useMemo(() => state.lines
    .map(line => {
      const game = games.find(g => g.id === line.id);
      return game ? { ...game, quantity: line.quantity, unitPrice: finalPrice(game) } : null;
    })
    .filter(Boolean), [state.lines, games]);

  const totals = calculateTotals(items.map(item => ({ price: item.unitPrice, quantity: item.quantity })), state.coupon);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    lines: state.lines,
    coupon: state.coupon,
    count,
    ...totals,
    addItem: (game, quantity = 1) => dispatch({ type: 'add', id: game.id, stock: game.stock, quantity }),
    setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', id, quantity, stock: games.find(g => g.id === id)?.stock }),
    removeItem: id => dispatch({ type: 'remove', id }),
    applyCoupon: code => {
      dispatch({ type: 'applyCoupon', code });
      return Boolean(COUPONS[String(code ?? '').trim().toUpperCase()]);
    },
    clear: () => dispatch({ type: 'clear' })
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
