import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import GameImage from '../../components/common/GameImage';
import Stepper from '../../components/common/Stepper';
import AddressFields from '../../components/store/AddressFields';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { orderService } from '../../services/orderService';
import { checkoutRules } from '../../utils/validators';
import { formatMoney } from '../../utils/format';
import { db } from '../../data/db';

const EMPTY_ADDRESS = { street: '', apartment: '', region: '', comuna: '', notes: '' };

/** Pasos del asistente: cada uno valida solo sus campos antes de avanzar. */
export const CHECKOUT_STEPS = [
  { label: 'Datos', icon: 'fa-user', fields: ['name', 'lastName', 'email'] },
  { label: 'Envío', icon: 'fa-truck-fast', fields: ['street', 'region', 'comuna'] },
  { label: 'Pago', icon: 'fa-credit-card', fields: ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'] }
];

/** Valores iniciales: si hay sesión (o un reintento de pago), se autocompletan los datos. */
export function initialCheckoutValues(user, retryOrder) {
  const source = retryOrder
    ? { ...retryOrder.customer, ...retryOrder.address }
    : user ? { name: user.name, lastName: user.lastName, email: user.email, ...EMPTY_ADDRESS, ...user.address } : {};
  return {
    name: '', lastName: '', email: '', ...EMPTY_ADDRESS, ...source,
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: ''
  };
}

const formatCard = value => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = value => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/** Resumen lateral del pedido (siempre visible mientras se avanza por los pasos). */
function OrderAside({ cart }) {
  return (
    <aside className="checkout-aside" aria-label="Resumen del pedido">
      <h5 className="mb-3">Tu pedido <small className="text-secondary">({cart.count})</small></h5>
      <ul className="checkout-lines">
        {cart.items.map(item => (
          <li key={item.id}>
            <GameImage game={item} className="thumb" />
            <span className="flex-grow-1"><span className="d-block">{item.title}</span><small className="text-secondary">{item.quantity} × {formatMoney(item.unitPrice)}</small></span>
            <strong>{formatMoney(item.unitPrice * item.quantity)}</strong>
          </li>
        ))}
      </ul>
      <div className="summary-row"><span>Subtotal</span><span>{formatMoney(cart.subtotal)}</span></div>
      {cart.couponDiscount > 0 && <div className="summary-row text-success"><span>Cupón {cart.coupon}</span><span>-{formatMoney(cart.couponDiscount)}</span></div>}
      <div className="summary-row"><span>Envío</span><span>Gratis</span></div>
      <hr />
      <div className="summary-row total"><span>Total</span><strong data-testid="checkout-total">{formatMoney(cart.total)}</strong></div>
    </aside>
  );
}

export default function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const retryOrder = params.get('reintento') ? db.orders.getById(params.get('reintento')) : null;
  const { values, errors, handleChange, validate, validateFields } = useForm(initialCheckoutValues(user, retryOrder), checkoutRules);
  const [step, setStep] = useState(retryOrder ? 2 : 0);
  const [error, setError] = useState('');

  const handleMasked = formatter => event => handleChange({ target: { name: event.target.name, value: formatter(event.target.value) } });

  if (!cart.items.length) {
    return (
      <div className="container py-5">
        <EmptyState icon="fa-bag-shopping" title="No hay productos para pagar" text="Agrega juegos al carrito antes de continuar.">
          <Link className="btn btn-primary" to="/productos">Ir al catálogo</Link>
        </EmptyState>
      </div>
    );
  }

  const next = () => {
    setError('');
    if (validateFields(CHECKOUT_STEPS[step].fields)) setStep(current => current + 1);
  };

  const pay = () => {
    setError('');
    if (!validate()) {
      // Si un dato de un paso anterior quedó inválido, se vuelve a ese paso.
      const first = CHECKOUT_STEPS.findIndex(s => s.fields.some(field => checkoutRules[field](values[field], values)));
      if (first >= 0 && first < step) setStep(first);
      setError('Revisa los campos marcados en rojo.');
      return;
    }
    try {
      const order = orderService.checkout({
        cart: cart.lines,
        coupon: cart.coupon,
        userId: user?.id ?? null,
        retryOrderId: retryOrder?.id ?? null,
        customer: { name: values.name.trim(), lastName: values.lastName.trim(), email: values.email.trim().toLowerCase() },
        address: { street: values.street.trim(), apartment: values.apartment.trim(), region: values.region, comuna: values.comuna, notes: values.notes.trim() },
        payment: { cardNumber: values.cardNumber }
      });
      if (order.status === 'pagada') {
        cart.clear();
        navigate(`/compra/exitosa/${order.id}`);
      } else {
        navigate(`/compra/error/${order.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (step < CHECKOUT_STEPS.length - 1) next();
    else pay();
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
        <div>
          <span className="section-kicker">COMPRA SEGURA</span>
          <h2 className="checkout-title mb-0">Checkout</h2>
        </div>
        {retryOrder && <span className="badge text-bg-warning p-2">Reintentando el pago de la orden {retryOrder.code}</span>}
      </div>
      <div className="row g-4 align-items-start">
        <div className="col-lg-7">
          <form className="checkout-card" noValidate onSubmit={handleSubmit}>
            <Stepper steps={CHECKOUT_STEPS} current={step} onStepClick={setStep} />

            {step === 0 && (
              <fieldset>
                <legend className="h5">Información del cliente</legend>
                {user ? <small className="text-secondary d-block mb-3">Datos completados desde tu cuenta.</small> : <small className="text-secondary d-block mb-3">¿Tienes cuenta? <Link to="/login" state={{ from: '/checkout' }}>Inicia sesión</Link> para autocompletar.</small>}
                <div className="row g-3">
                  <FormField className="col-md-6" label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required autoComplete="given-name" />
                  <FormField className="col-md-6" label="Apellidos" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} required autoComplete="family-name" />
                  <FormField className="col-12" label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" hint="Aquí te enviaremos la boleta." />
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="h5">Dirección de entrega</legend>
                <small className="text-secondary d-block mb-3">Ingresa la dirección de forma detallada.</small>
                <AddressFields values={values} errors={errors} onChange={handleChange} />
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="h5">Pago</legend>
                <div className="checkout-review mb-3">
                  <div>
                    <small className="text-secondary d-block">Cliente</small>
                    <span>{values.name} {values.lastName} · {values.email}</span>
                    <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => setStep(0)}>Editar</button>
                  </div>
                  <div>
                    <small className="text-secondary d-block">Envío</small>
                    <span>{values.street}{values.apartment && `, ${values.apartment}`} · {values.comuna}, {values.region}</span>
                    <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => setStep(1)}>Editar</button>
                  </div>
                </div>
                <small className="text-secondary d-block mb-3"><i className="fa-solid fa-lock me-1" />Pasarela simulada. La tarjeta 4000 0000 0000 0002 siempre es rechazada.</small>
                <div className="row g-3">
                  <FormField className="col-md-6" label="Nombre del titular" name="cardName" value={values.cardName} onChange={handleChange} error={errors.cardName} required autoComplete="cc-name" />
                  <FormField className="col-md-6" label="Número de tarjeta" name="cardNumber" inputMode="numeric" placeholder="1234 5678 9012 3456" value={values.cardNumber} onChange={handleMasked(formatCard)} error={errors.cardNumber} required autoComplete="cc-number" />
                  <FormField className="col-6 col-md-3" label="Vencimiento" name="cardExpiry" placeholder="MM/AA" value={values.cardExpiry} onChange={handleMasked(formatExpiry)} error={errors.cardExpiry} required autoComplete="cc-exp" />
                  <FormField className="col-6 col-md-3" label="CVV" name="cardCvv" type="password" inputMode="numeric" placeholder="123" maxLength={3} value={values.cardCvv} onChange={handleMasked(v => v.replace(/\D/g, '').slice(0, 3))} error={errors.cardCvv} required />
                </div>
              </fieldset>
            )}

            <div className="mt-4"><AlertMessage message={error} /></div>
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              {step === 0
                ? <Link to="/carrito" className="btn btn-soft"><i className="fa-solid fa-arrow-left me-2" />Volver al carrito</Link>
                : <button type="button" className="btn btn-soft" onClick={() => { setError(''); setStep(step - 1); }}><i className="fa-solid fa-arrow-left me-2" />Atrás</button>}
              {step < CHECKOUT_STEPS.length - 1
                ? <button type="submit" className="btn btn-primary btn-lg">Continuar<i className="fa-solid fa-arrow-right ms-2" /></button>
                : <button type="submit" className="btn btn-success btn-lg">Pagar ahora {formatMoney(cart.total)}</button>}
            </div>
          </form>
        </div>
        <div className="col-lg-5">
          <OrderAside cart={cart} />
        </div>
      </div>
    </div>
  );
}
