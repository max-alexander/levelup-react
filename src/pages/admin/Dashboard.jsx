import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { useCollection } from '../../hooks/useCollection';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { rawgService } from '../../services/rawgService';
import { isCritical } from '../../utils/catalog';
import { formatMoney } from '../../utils/format';

const MODULES = [
  { to: '/admin/ordenes', icon: 'fa-receipt', title: 'Órdenes', text: 'Gestión y seguimiento de las órdenes de compra.' },
  { to: '/admin/productos', icon: 'fa-gamepad', title: 'Productos', text: 'Inventario y detalle de los productos disponibles.' },
  { to: '/admin/categorias', icon: 'fa-tags', title: 'Categorías', text: 'Organiza los productos para facilitar la navegación.' },
  { to: '/admin/usuarios', icon: 'fa-users', title: 'Usuarios', text: 'Cuentas de usuario, roles e historial de compras.' },
  { to: '/admin/resenas', icon: 'fa-star', title: 'Reseñas', text: 'Modera las opiniones que publican los clientes.' },
  { to: '/admin/reportes', icon: 'fa-chart-line', title: 'Reportes', text: 'Informes sobre ventas y operaciones del sistema.' },
  { to: '/admin/perfil', icon: 'fa-user', title: 'Perfil', text: 'Información personal y configuración de la cuenta.' },
  { to: '/', icon: 'fa-store', title: 'Tienda', text: 'Visualiza la tienda tal como la ven los clientes.' }
];

export default function Dashboard() {
  const games = useCollection(db.games);
  const users = useCollection(db.users);
  const orders = useCollection(db.orders);
  const { notify } = useToast();
  const [syncing, setSyncing] = useState(false);

  const paid = orders.filter(order => order.status === 'pagada');
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const inventory = games.reduce((sum, game) => sum + Number(game.stock), 0);
  const critical = games.filter(isCritical).length;
  const missingCovers = games.filter(game => !game.image).length;

  const syncCovers = async () => {
    setSyncing(true);
    try {
      const result = await rawgService.syncCovers();
      notify('Catálogo sincronizado', `${result.updated} portadas actualizadas${result.failed ? `, ${result.failed} sin resultado` : ''}.`, result.failed ? 'warning' : 'success');
    } catch {
      notify('No se pudo sincronizar', 'Revisa tu conexión e intenta nuevamente.', 'danger');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <PageHeader kicker="ADMINISTRACIÓN" title="Dashboard" text="Resumen de las actividades diarias">
        <button type="button" className="btn btn-soft" disabled={syncing || !missingCovers} onClick={syncCovers}>
          {syncing ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="fa-solid fa-arrows-rotate me-2" />}
          {missingCovers ? `Sincronizar ${missingCovers} portadas (RAWG)` : 'Portadas al día'}
        </button>
      </PageHeader>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard label="Compras" value={paid.length} icon="fa-cart-shopping" tone="primary" hint={`Ventas totales: ${formatMoney(revenue)}`} /></div>
        <div className="col-md-4"><StatCard label="Productos" value={games.length} icon="fa-box" tone="success" hint={`Inventario actual: ${inventory} unidades`} /></div>
        <div className="col-md-4"><StatCard label="Usuarios" value={users.length} icon="fa-users" tone="warning" hint={`${critical} productos con stock crítico`} /></div>
      </div>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {MODULES.map(module => (
          <div className="col" key={module.title}>
            <Link to={module.to} className="module-card">
              <i className={`fa-solid ${module.icon}`} />
              <strong>{module.title}</strong>
              <small>{module.text}</small>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
