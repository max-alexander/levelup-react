import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-gauge', end: true },
  { to: '/admin/ordenes', label: 'Órdenes', icon: 'fa-receipt' },
  { to: '/admin/productos', label: 'Productos', icon: 'fa-gamepad' },
  { to: '/admin/categorias', label: 'Categorías', icon: 'fa-tags' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: 'fa-users' },
  { to: '/admin/reportes', label: 'Reportes', icon: 'fa-chart-line' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `admin-link${isActive ? ' active' : ''}`;

  return (
    <div className="admin-shell">
      <header className="admin-topbar d-lg-none">
        <Link className="brand" to="/admin"><span className="brand-mark"><i className="fa-solid fa-gamepad" /></span><span>LEVEL/UP Admin</span></Link>
        <button type="button" className="btn icon-btn" aria-label="Abrir menú de administración" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <i className="fa-solid fa-bars" />
        </button>
      </header>
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <Link className="brand d-none d-lg-inline-flex mb-4" to="/admin"><span className="brand-mark"><i className="fa-solid fa-gamepad" /></span><span>LEVEL/UP</span></Link>
        <nav className="d-flex flex-column gap-1" aria-label="Administración">
          {LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setOpen(false)}>
              <i className={`fa-solid ${link.icon}`} />{link.label}
            </NavLink>
          ))}
          <hr />
          <NavLink to="/admin/perfil" className={linkClass} onClick={() => setOpen(false)}><i className="fa-solid fa-user" />Perfil</NavLink>
        </nav>
        <div className="mt-auto pt-4 d-grid gap-2">
          <small className="text-secondary">Sesión: {user?.email}</small>
          <Link className="btn btn-soft" to="/"><i className="fa-solid fa-store me-2" />Tienda</Link>
          <button type="button" className="btn btn-outline-danger" onClick={() => { logout(); navigate('/'); }}>
            <i className="fa-solid fa-arrow-right-from-bracket me-2" />Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
