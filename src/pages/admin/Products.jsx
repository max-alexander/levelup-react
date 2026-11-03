import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import GameImage from '../../components/common/GameImage';
import Stars from '../../components/common/Stars';
import PriceTag from '../../components/common/PriceTag';
import { useCollection } from '../../hooks/useCollection';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { filterGames, isCritical } from '../../utils/catalog';
import { finalPrice, formatMoney } from '../../utils/format';

function StockBadge({ stock }) {
  const tone = stock === 0 ? 'danger' : stock <= 5 ? 'warning' : 'success';
  return <span className={`badge text-bg-${tone}`}>{stock}</span>;
}

/** Tabla reutilizada por el listado general y el de productos críticos. */
export function ProductTable({ games, onDelete }) {
  if (!games.length) return <EmptyState icon="fa-box-open" title="Sin productos" text="No hay productos para mostrar." />;
  return (
    <div className="table-responsive">
      <table className="table app-table align-middle">
        <thead><tr><th>ID</th><th>Juego</th><th>Plataforma</th><th>Stock</th><th>Precio</th><th className="text-end">Acciones</th></tr></thead>
        <tbody>
          {games.map(game => (
            <tr key={game.id}>
              <td>#{game.id}</td>
              <td>
                <div className="table-game">
                  <GameImage game={game} className="thumb" />
                  <div><strong>{game.title}</strong><small className="d-block text-secondary">{game.category}{game.discount > 0 && ` · -${game.discount}%`}</small></div>
                </div>
              </td>
              <td>{game.platform}</td>
              <td><StockBadge stock={game.stock} /></td>
              <td>{formatMoney(finalPrice(game))}</td>
              <td className="text-end text-nowrap">
                <Link className="btn btn-sm btn-outline-info me-1" to={`/admin/productos/${game.id}`} aria-label={`Ver ${game.title}`}><i className="fa-solid fa-eye" /></Link>
                <Link className="btn btn-sm btn-outline-warning me-1" to={`/admin/productos/${game.id}/editar`} aria-label={`Editar ${game.title}`}><i className="fa-solid fa-pen" /></Link>
                {onDelete && <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Eliminar ${game.title}`} onClick={() => onDelete(game)}><i className="fa-solid fa-trash" /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductList() {
  const games = useCollection(db.games);
  const { notify } = useToast();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const confirmDelete = () => {
    db.games.remove(toDelete.id);
    notify('Producto eliminado', toDelete.title, 'info');
    setToDelete(null);
  };

  return (
    <>
      <PageHeader kicker="INVENTARIO" title="Productos" text={`${games.length} productos · ${games.filter(isCritical).length} con stock crítico`}>
        <Link className="btn btn-soft" to="/admin/productos/criticos"><i className="fa-solid fa-triangle-exclamation me-2" />Críticos</Link>
        <Link className="btn btn-soft" to="/admin/productos/reportes"><i className="fa-solid fa-chart-column me-2" />Reportes</Link>
        <Link className="btn btn-primary" to="/admin/productos/nuevo"><i className="fa-solid fa-plus me-2" />Nuevo producto</Link>
      </PageHeader>
      <div className="surface-card">
        <input className="form-control mb-3" type="search" placeholder="Buscar producto..." aria-label="Buscar producto" value={query} onChange={event => setQuery(event.target.value)} />
        <ProductTable games={filterGames(games, { query, sort: 'name' })} onDelete={setToDelete} />
      </div>
      <ConfirmModal show={Boolean(toDelete)} title="Eliminar producto" message={`¿Quieres eliminar “${toDelete?.title}”?`} confirmLabel="Eliminar" onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
    </>
  );
}

export function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = useCollection(db.games).find(item => String(item.id) === id);
  const orders = useCollection(db.orders);
  if (!game) return <EmptyState icon="fa-ghost" title="Producto no encontrado"><Link className="btn btn-primary" to="/admin/productos">Volver</Link></EmptyState>;
  const sold = orders.filter(order => order.status === 'pagada').flatMap(order => order.items).filter(item => item.id === game.id).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <PageHeader kicker="PRODUCTO" title={game.title}>
        <Link className="btn btn-soft" to="/admin/productos"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
        <button type="button" className="btn btn-warning" onClick={() => navigate(`/admin/productos/${game.id}/editar`)}><i className="fa-solid fa-pen me-2" />Editar producto</button>
      </PageHeader>
      <div className="surface-card p-0 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-5"><GameImage game={game} className="game-detail-image" /></div>
          <div className="col-md-7 p-4">
            <span className="section-kicker">{game.category} · {game.platform}</span>
            <div className="my-2"><Stars rating={game.rating} /></div>
            <p className="text-secondary">{game.description}</p>
            <PriceTag game={game} />
            <dl className="row mt-3 mb-0">
              <dt className="col-6">Stock</dt><dd className="col-6"><StockBadge stock={game.stock} /></dd>
              <dt className="col-6">Unidades vendidas</dt><dd className="col-6">{sold}</dd>
              <dt className="col-6">Destacado</dt><dd className="col-6">{game.featured ? 'Sí' : 'No'}</dd>
              <dt className="col-6">Origen de portada</dt><dd className="col-6">{game.image ? 'RAWG / URL' : 'Sin imagen'}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

export function CriticalProducts() {
  const games = useCollection(db.games).filter(isCritical).sort((a, b) => a.stock - b.stock);
  return (
    <>
      <PageHeader kicker="INVENTARIO" title="Listado de productos críticos" text="Productos con 5 unidades o menos. Repón stock para no perder ventas.">
        <Link className="btn btn-soft" to="/admin/productos"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
      </PageHeader>
      <div className="surface-card"><ProductTable games={games} /></div>
    </>
  );
}

export function ProductReports() {
  const games = useCollection(db.games);
  const orders = useCollection(db.orders).filter(order => order.status === 'pagada');
  const soldById = {};
  orders.flatMap(order => order.items).forEach(item => {
    soldById[item.id] = (soldById[item.id] ?? 0) + item.quantity;
  });
  const rows = games.map(game => ({ ...game, sold: soldById[game.id] ?? 0, stockValue: finalPrice(game) * game.stock })).sort((a, b) => b.sold - a.sold);
  const totalValue = rows.reduce((sum, row) => sum + row.stockValue, 0);

  return (
    <>
      <PageHeader kicker="INVENTARIO" title="Reporte de productos" text={`Valor total del inventario: ${formatMoney(totalValue)}`}>
        <Link className="btn btn-soft" to="/admin/productos"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
      </PageHeader>
      <div className="surface-card">
        <div className="table-responsive">
          <table className="table app-table align-middle">
            <thead><tr><th>Producto</th><th>Plataforma</th><th>Vendidos</th><th>Stock</th><th className="text-end">Valor en stock</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}><td>{row.title}</td><td>{row.platform}</td><td>{row.sold}</td><td>{row.stock}</td><td className="text-end">{formatMoney(row.stockValue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
