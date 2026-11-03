import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import StoreLayout from './components/layout/StoreLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/store/Home';
import Catalog from './pages/store/Catalog';
import GameDetail from './pages/store/GameDetail';
import Categories from './pages/store/Categories';
import Offers from './pages/store/Offers';
import Favorites from './pages/store/Favorites';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import PaymentResult from './pages/store/PaymentResult';
import Login from './pages/store/Login';
import Register from './pages/store/Register';
import About from './pages/store/About';
import { BlogDetail, BlogList } from './pages/store/Blogs';
import Contact from './pages/store/Contact';
import Account from './pages/store/Account';
import NotFound from './pages/store/NotFound';

// Carga diferida (code splitting): el panel admin es un archivo JS aparte que solo
// se descarga cuando un administrador entra a /admin.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

export function PageLoader() {
  return (
    <div className="page-loader" role="status">
      <span className="spinner-border" aria-hidden="true" />
      <span>Cargando panel…</span>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Catalog />} />
        <Route path="productos/:id" element={<GameDetail />} />
        <Route path="categorias" element={<Categories />} />
        <Route path="categorias/:name" element={<Categories />} />
        <Route path="ofertas" element={<Offers />} />
        <Route path="favoritos" element={<Favorites />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra/exitosa/:id" element={<PaymentResult success />} />
        <Route path="compra/error/:id" element={<PaymentResult success={false} />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="nosotros" element={<About />} />
        <Route path="blogs" element={<BlogList />} />
        <Route path="blogs/:slug" element={<BlogDetail />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="mi-cuenta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin/*"
        element={(
          <ProtectedRoute role="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminApp />
            </Suspense>
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}

/** Proveedores globales: tema, sesión, carrito, favoritos y notificaciones. */
export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>{children}</CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
