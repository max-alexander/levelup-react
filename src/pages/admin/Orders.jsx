import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import OrderSummary from '../../components/store/OrderSummary';
import { StatusBadge } from '../../components/store/OrderHistory';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { formatDate, formatMoney } from '../../utils/format';

export function OrderList() {
  const orders = useCollection(db.orders);
  const [status, setStatus] = useState('all');
  const visible = orders.filter(order => status === 'all' || order.status === status).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <PageHeader kicker="VENTAS" title="Órdenes / Boletas" text={`${visible.length} orden(es)`}>
        <select className="form-select" aria-label="Filtrar por estado" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="pagada">Pagadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </PageHeader>
      <div className="surface-card">
        <div className="table-responsive">
          <table className="table app-table align-middle">
            <thead><tr><th>Código</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>
              {visible.length ? visible.map(order => (
                <tr key={order.id}>
                  <td>{order.code}</td>
                  <td>{order.customer.name} {order.customer.lastName}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-end"><Link className="btn btn-sm btn-outline-info" to={`/admin/ordenes/${order.id}`}>Mostrar boleta</Link></td>
                </tr>
              )) : <tr><td colSpan={7} className="text-center text-secondary py-4">No hay órdenes registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const order = useCollection(db.orders).find(item => String(item.id) === id);
  if (!order) return <EmptyState icon="fa-receipt" title="Orden no encontrada"><Link className="btn btn-primary" to="/admin/ordenes">Volver</Link></EmptyState>;
  return (
    <>
      <PageHeader kicker="BOLETA" title={`Boleta ${order.code}`} text={`Orden #${order.id}`}>
        <Link className="btn btn-soft" to="/admin/ordenes"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
        <button type="button" className="btn btn-danger" onClick={() => window.print()}><i className="fa-solid fa-print me-2" />Imprimir</button>
      </PageHeader>
      <div className="surface-card">
        <div className="mb-3"><StatusBadge status={order.status} /> {order.authorization && <small className="text-secondary ms-2">Autorización {order.authorization}</small>}</div>
        <OrderSummary order={order} totalLabel={order.status === 'pagada' ? 'Total pagado' : 'Total (no pagado)'} />
      </div>
    </>
  );
}
