import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import AddressFields from '../../components/store/AddressFields';
import OrderItemsTable from '../../components/store/OrderItemsTable';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { orderService } from '../../services/orderService';
import { checkoutRules } from '../../utils/validators';
import { formatMoney } from '../../utils/format';
import { db } from '../../data/db';

const EMPTY_ADDRESS = { street: '', apartment: '', region: '', comuna: '', notes: '' };

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

export default function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const retryOrder = params.get('reintento') ? db.orders.getById(params.get('reintento')) : null;
  const { values, errors, handleChange, validate } = useForm(initialCheckoutValues(user, retryOrder), checkoutRules);
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

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) {
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

  return (
    <div className="container py-5">
      <form className="checkout-card mx-auto" noValidate onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h3 className="mb-0">Carrito de compra</h3>
            <small className="text-secondary">Completa la siguiente información</small>
          </div>
          <span className="badge text-bg-primary fs-6 p-2">Total a pagar: {formatMoney(cart.total)}</span>
        </div>
        <OrderItemsTable items={cart.items.map(item => ({ ...item, price: item.unitPrice }))} />

        <h5 className="mt-4">Información del cliente</h5>
        {user ? <small className="text-secondary d-block mb-2">Datos completados desde tu cuenta.</small> : <small className="text-secondary d-block mb-2">¿Tienes cuenta? <Link to="/login" state={{ from: '/checkout' }}>Inicia sesión</Link> para autocompletar.</small>}
        <div className="row g-3">
          <FormField className="col-md-4" label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
          <FormField className="col-md-4" label="Apellidos" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} required />
          <FormField className="col-md-4" label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
        </div>

        <h5 className="mt-4">Dirección de entrega de los productos</h5>
        <small className="text-secondary d-block mb-2">Ingrese dirección de forma detallada</small>
        <AddressFields values={values} errors={errors} onChange={handleChange} />

        <h5 className="mt-4">Pago</h5>
        <small className="text-secondary d-block mb-2">Pasarela simulada. La tarjeta 4000 0000 0000 0002 siempre es rechazada.</small>
        <div className="row g-3">
          <FormField className="col-md-6" label="Nombre del titular" name="cardName" value={values.cardName} onChange={handleChange} error={errors.cardName} required autoComplete="cc-name" />
          <FormField className="col-md-6" label="Número de tarjeta" name="cardNumber" inputMode="numeric" placeholder="1234 5678 9012 3456" value={values.cardNumber} onChange={handleMasked(formatCard)} error={errors.cardNumber} required autoComplete="cc-number" />
          <FormField className="col-6 col-md-3" label="Vencimiento" name="cardExpiry" placeholder="MM/AA" value={values.cardExpiry} onChange={handleMasked(formatExpiry)} error={errors.cardExpiry} required autoComplete="cc-exp" />
          <FormField className="col-6 col-md-3" label="CVV" name="cardCvv" type="password" inputMode="numeric" placeholder="123" maxLength={3} value={values.cardCvv} onChange={handleMasked(v => v.replace(/\D/g, '').slice(0, 3))} error={errors.cardCvv} required />
        </div>

        <div className="mt-4"><AlertMessage message={error} /></div>
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <Link to="/carrito" className="btn btn-soft"><i className="fa-solid fa-arrow-left me-2" />Volver al carrito</Link>
          <button type="submit" className="btn btn-success btn-lg">Pagar ahora {formatMoney(cart.total)}</button>
        </div>
      </form>
    </div>
  );
}
