import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameImage from '../../components/common/GameImage';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertMessage from '../../components/common/AlertMessage';
import { useCart } from '../../context/CartContext';
import { formatMoney } from '../../utils/format';

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState(cart.coupon ?? '');
  const [couponMsg, setCouponMsg] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const applyCoupon = () => {
    const ok = cart.applyCoupon(code);
    setCouponMsg(ok ? { type: 'success', text: 'Cupón aplicado: 10% de descuento.' } : { type: 'danger', text: 'Código no válido.' });
  };

  if (!cart.items.length) {
    return (
      <div className="container py-5">
        <PageHeader kicker="COMPRA" title="Carrito de compras" />
        <EmptyState icon="fa-bag-shopping" title="Tu carrito está vacío" text="Agrega juegos para continuar.">
          <Link className="btn btn-primary" to="/productos">Ir al catálogo</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <PageHeader kicker="COMPRA" title="Carrito de compras" text={`${cart.count} producto(s) en tu carrito`} />
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="surface-card">
            {cart.items.map(item => (
              <div className="cart-item" key={item.id} data-testid="cart-item">
                <GameImage game={item} className="cart-thumb" />
                <div>
                  <Link className="fw-bold text-reset text-decoration-none" to={`/productos/${item.id}`}>{item.title}</Link>
                  <small className="d-block text-secondary">{item.platform} · {formatMoney(item.unitPrice)} c/u</small>
                  <small className="d-block">Subtotal: <strong>{formatMoney(item.unitPrice * item.quantity)}</strong></small>
                </div>
                <div className="qty-control">
                  <button type="button" aria-label={`Restar ${item.title}`} onClick={() => cart.setQuantity(item.id, item.quantity - 1)}>−</button>
                  <strong aria-label="Cantidad">{item.quantity}</strong>
                  <button type="button" aria-label={`Sumar ${item.title}`} disabled={item.quantity >= item.stock} onClick={() => cart.setQuantity(item.id, item.quantity + 1)}>+</button>
                  <button type="button" className="ms-2 text-danger" aria-label={`Eliminar ${item.title}`} onClick={() => cart.removeItem(item.id)}><i className="fa-solid fa-trash" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="cart-summary">
            <div className="summary-row"><span>Subtotal</span><strong>{formatMoney(cart.subtotal)}</strong></div>
            <div className="summary-row"><span>Cupón</span><strong>-{formatMoney(cart.couponDiscount)}</strong></div>
            <hr />
            <div className="summary-row total"><span>Total</span><strong data-testid="cart-total">{formatMoney(cart.total)}</strong></div>
            <div className="input-group my-3">
              <input className="form-control" aria-label="Código de descuento" maxLength={20} placeholder="Código de descuento" value={code} onChange={event => setCode(event.target.value)} />
              <button type="button" className="btn btn-outline-light" onClick={applyCoupon}>Aplicar</button>
            </div>
            <AlertMessage message={couponMsg?.text} type={couponMsg?.type} onClose={() => setCouponMsg(null)} />
            <button type="button" className="btn btn-success w-100" onClick={() => navigate('/checkout')}>Comprar ahora</button>
            <button type="button" className="btn btn-link text-danger w-100 mt-2" onClick={() => setConfirmClear(true)}>Vaciar carrito</button>
          </div>
        </div>
      </div>
      <ConfirmModal show={confirmClear} title="Vaciar carrito" message="¿Quieres eliminar todos los productos?" confirmLabel="Vaciar"
        onCancel={() => setConfirmClear(false)} onConfirm={() => { cart.clear(); setConfirmClear(false); }} />
    </div>
  );
}
