import { Link } from 'react-router-dom';
import { formatDate, formatMoney } from '../../utils/format';

export function StatusBadge({ status }) {
  return <span className={`badge ${status === 'pagada' ? 'text-bg-success' : 'text-bg-danger'}`}>{status === 'pagada' ? 'Pagada' : 'Rechazada'}</span>;
}

/** Historial de compras. linkTo(order) permite enlazar a la boleta (admin) o no (cliente). */
export default function OrderHistory({ orders, linkTo }) {
  if (!orders.length) return <p className="text-secondary mb-0">Aún no hay compras registradas.</p>;
  const sorted = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="d-grid gap-2">
      {sorted.map(order => (
        <div className="order-card" key={order.id}>
          <div className="d-flex justify-content-between gap-2">
            <strong>{linkTo ? <Link to={linkTo(order)}>Orden {order.code}</Link> : `Orden ${order.code}`}</strong>
            <strong>{formatMoney(order.total)}</strong>
          </div>
          <div className="d-flex justify-content-between gap-2 mt-1">
            <small className="text-secondary">{formatDate(order.date)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} producto(s)</small>
            <StatusBadge status={order.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
