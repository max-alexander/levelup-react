import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { formatMoney } from '../../utils/format';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count, total } = useCart();
  const favorites = useFavorites();
  const categories = useCollection(db.categories);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [search, setSearch] = useState('');

  const close = () => {
    setOpen(false);
    setMenu(null);
  };
  const toggleMenu = name => setMenu(current => (current === name ? null : name));

  const submitSearch = event => {
    event.preventDefault();
    navigate(`/productos?q=${encodeURIComponent(search.trim())}`);
    close();
  };

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg app-nav sticky-top" aria-label="Navegación principal">
      <div className="container py-2">
        <Link className="navbar-brand brand" to="/" onClick={close}>
          <span className="brand-mark"><i className="fa-solid fa-gamepad" /></span><span>LEVEL/UP</span>
        </Link>
        <button className="navbar-toggler border-0" type="button" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <i className="fa-solid fa-bars text-white fs-4" />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <div className="navbar-nav ms-lg-3 gap-lg-1">
            <NavLink className={linkClass} to="/" end onClick={close}>Home</NavLink>
            <NavLink className={linkClass} to="/productos" onClick={close}>Productos</NavLink>
            <div className={`nav-item dropdown ${menu === 'cat' ? 'show' : ''}`}>
              <button type="button" className="nav-link dropdown-toggle btn btn-link" aria-expanded={menu === 'cat'} onClick={() => toggleMenu('cat')}>Categorías</button>
              <ul className={`dropdown-menu dropdown-menu-dark ${menu === 'cat' ? 'show' : ''}`}>
                <li><Link className="dropdown-item" to="/categorias" onClick={close}>Todas las categorías</Link></li>
                <li><hr className="dropdown-divider" /></li>
                {categories.map(category => (
                  <li key={category.id}><Link className="dropdown-item" to={`/categorias/${encodeURIComponent(category.name)}`} onClick={close}>{category.name}</Link></li>
                ))}
              </ul>
            </div>
            <NavLink className={linkClass} to="/ofertas" onClick={close}>Ofertas</NavLink>
            <NavLink className={linkClass} to="/nosotros" onClick={close}>Nosotros</NavLink>
            <NavLink className={linkClass} to="/blogs" onClick={close}>Blog</NavLink>
            <NavLink className={linkClass} to="/contacto" onClick={close}>Contacto</NavLink>
          </div>

          <form className="nav-search ms-lg-3 my-3 my-lg-0" role="search" onSubmit={submitSearch}>
            <input className="form-control" type="search" placeholder="Buscar" aria-label="Buscar en la tienda" value={search} onChange={event => setSearch(event.target.value)} />
            <button className="btn btn-soft" type="submit" aria-label="Buscar"><i className="fa-solid fa-magnifying-glass" /></button>
          </form>

          <div className="d-flex align-items-center gap-2 ms-lg-auto nav-actions">
            <Link className="btn icon-btn position-relative" to="/favoritos" aria-label="Favoritos" onClick={close}>
              <i className="fa-regular fa-heart" />{favorites.ids.length > 0 && <span className="cart-badge">{favorites.ids.length}</span>}
            </Link>
            <Link className="btn btn-success cart-btn" to="/carrito" aria-label="Carrito" onClick={close}>
              <i className="fa-solid fa-cart-shopping me-2" />
              <span data-testid="cart-count">{count}</span>
              <span className="d-none d-xxl-inline ms-2">· {formatMoney(total)}</span>
            </Link>
            {user ? (
              <div className={`dropdown ${menu === 'user' ? 'show' : ''}`}>
                <button type="button" className="btn user-button dropdown-toggle" aria-expanded={menu === 'user'} onClick={() => toggleMenu('user')}>
                  <span>{user.name.charAt(0).toUpperCase()}</span><span>{user.name}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end dropdown-menu-dark ${menu === 'user' ? 'show' : ''}`}>
                  <li><Link className="dropdown-item" to="/mi-cuenta" onClick={close}><i className="fa-regular fa-user me-2" />Mi cuenta</Link></li>
                  {isAdmin && <li><Link className="dropdown-item" to="/admin" onClick={close}><i className="fa-solid fa-sliders me-2" />Administración</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button type="button" className="dropdown-item text-danger" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket me-2" />Cerrar sesión</button></li>
                </ul>
              </div>
            ) : (
              <>
                <Link className="btn btn-outline-light" to="/login" onClick={close}>Iniciar sesión</Link>
                <Link className="btn btn-primary" to="/registro" onClick={close}>Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
