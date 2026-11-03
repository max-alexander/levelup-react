import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { PLATFORMS } from '../../data/seed';
import { formatMoney } from '../../utils/format';

/** Agrupa las ventas pagadas por una clave (plataforma, categoría, mes...). */
export function groupSales(orders, games, keyOf) {
  const totals = {};
  orders.filter(order => order.status === 'pagada').forEach(order => {
    order.items.forEach(item => {
      const key = keyOf(item, order, games.find(game => game.id === item.id));
      if (!key) return;
      totals[key] = (totals[key] ?? 0) + item.price * item.quantity;
    });
  });
  return totals;
}

function BarList({ data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  if (!entries.length) return <p className="text-secondary mb-0">Sin datos.</p>;
  return (
    <div className="d-grid gap-2">
      {entries.map(([label, value]) => (
        <div key={label}>
          <div className="d-flex justify-content-between small"><span>{label}</span><strong>{formatMoney(value)}</strong></div>
          <div className="progress" role="progressbar" aria-label={label} aria-valuenow={Math.round((value / max) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar" style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const orders = useCollection(db.orders);
  const games = useCollection(db.games);
  const paid = orders.filter(order => order.status === 'pagada');
  const rejected = orders.length - paid.length;
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const average = paid.length ? Math.round(revenue / paid.length) : 0;

  const byPlatform = groupSales(orders, games, (item, _order, game) => item.platform ?? game?.platform ?? 'Sin plataforma');
  PLATFORMS.forEach(platform => { byPlatform[platform] = byPlatform[platform] ?? 0; });
  const byCategory = groupSales(orders, games, (_item, _order, game) => game?.category ?? 'Producto eliminado');
  const byMonth = groupSales(orders, games, (_item, order) => order.date.slice(0, 7));

  return (
    <>
      <PageHeader kicker="ANÁLISIS" title="Reportes" text="Informe de ventas y operaciones del sistema." />
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard label="Ventas" value={formatMoney(revenue)} icon="fa-sack-dollar" tone="success" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Órdenes pagadas" value={paid.length} icon="fa-receipt" tone="primary" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Pagos rechazados" value={rejected} icon="fa-ban" tone="danger" /></div>
        <div className="col-sm-6 col-xl-3"><StatCard label="Ticket promedio" value={formatMoney(average)} icon="fa-scale-balanced" tone="warning" /></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-4"><div className="surface-card h-100"><h5 className="mb-3">Ventas por plataforma</h5><BarList data={byPlatform} /></div></div>
        <div className="col-lg-4"><div className="surface-card h-100"><h5 className="mb-3">Ventas por categoría</h5><BarList data={byCategory} /></div></div>
        <div className="col-lg-4"><div className="surface-card h-100"><h5 className="mb-3">Ventas por mes</h5><BarList data={byMonth} /></div></div>
      </div>
    </>
  );
}
