import OrderItemsTable from './OrderItemsTable';
import { formatDate, formatMoney } from '../../utils/format';

/** Resumen de una orden (vista de pago exitoso, pago con error y boleta en el admin). */
export default function OrderSummary({ order, totalLabel = 'Total pagado' }) {
  const { customer, address } = order;
  return (
    <div className="order-summary">
      <div className="row g-3 mb-3">
        <div className="col-sm-4"><small className="text-secondary d-block">Nombre</small><span className="readonly-field">{customer.name}</span></div>
        <div className="col-sm-4"><small className="text-secondary d-block">Apellidos</small><span className="readonly-field">{customer.lastName}</span></div>
        <div className="col-sm-4"><small className="text-secondary d-block">Correo</small><span className="readonly-field text-break">{customer.email}</span></div>
      </div>
      <h6 className="mt-4">Dirección de entrega</h6>
      <div className="row g-3 mb-4">
        <div className="col-sm-8"><small className="text-secondary d-block">Calle</small><span className="readonly-field">{address.street}</span></div>
        <div className="col-sm-4"><small className="text-secondary d-block">Departamento</small><span className="readonly-field">{address.apartment || '—'}</span></div>
        <div className="col-sm-6"><small className="text-secondary d-block">Región</small><span className="readonly-field">{address.region}</span></div>
        <div className="col-sm-6"><small className="text-secondary d-block">Comuna</small><span className="readonly-field">{address.comuna}</span></div>
        {address.notes && <div className="col-12"><small className="text-secondary d-block">Indicaciones</small><span className="readonly-field">{address.notes}</span></div>}
      </div>
      <OrderItemsTable items={order.items} />
      <div className="total-box mt-4">
        {order.couponDiscount > 0 && <div className="small text-secondary">Subtotal {formatMoney(order.subtotal)} · Cupón -{formatMoney(order.couponDiscount)}</div>}
        <strong>{totalLabel}: {formatMoney(order.total)}</strong>
        <div className="small text-secondary">{formatDate(order.date)}</div>
      </div>
    </div>
  );
}
