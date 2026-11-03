import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './context/ToastContext';
import StoreLayout from './components/layout/StoreLayout';
import AdminLayout from './components/admin/AdminLayout';
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

import Dashboard from './pages/admin/Dashboard';
import { OrderDetail, OrderList } from './pages/admin/Orders';
import { CriticalProducts, ProductList, ProductReports, ProductView } from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import { CategoryForm, CategoryList } from './pages/admin/Categories';
import { UserForm, UserList, UserView } from './pages/admin/Users';
import Reports from './pages/admin/Reports';

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

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

      <Route path="admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="ordenes" element={<OrderList />} />
        <Route path="ordenes/:id" element={<OrderDetail />} />
        <Route path="productos" element={<ProductList />} />
        <Route path="productos/nuevo" element={<ProductForm />} />
        <Route path="productos/criticos" element={<CriticalProducts />} />
        <Route path="productos/reportes" element={<ProductReports />} />
        <Route path="productos/:id" element={<ProductView />} />
        <Route path="productos/:id/editar" element={<ProductForm />} />
        <Route path="categorias" element={<CategoryList />} />
        <Route path="categorias/nueva" element={<CategoryForm />} />
        <Route path="categorias/:id/editar" element={<CategoryForm />} />
        <Route path="usuarios" element={<UserList />} />
        <Route path="usuarios/nuevo" element={<UserForm />} />
        <Route path="usuarios/:id" element={<UserView />} />
        <Route path="usuarios/:id/editar" element={<UserForm />} />
        <Route path="usuarios/:id/historial" element={<UserView historyOnly />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="perfil" element={<Account admin />} />
      </Route>
    </Routes>
  );
}

/** Proveedores globales: sesión, carrito, favoritos y notificaciones. */
export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>{children}</CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
