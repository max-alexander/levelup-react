// Panel de administración completo. App.jsx lo carga bajo demanda con React.lazy:
// quien solo compra en la tienda nunca descarga este código.
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Dashboard from './Dashboard';
import { OrderDetail, OrderList } from './Orders';
import { CriticalProducts, ProductList, ProductReports, ProductView } from './Products';
import ProductForm from './ProductForm';
import { CategoryForm, CategoryList } from './Categories';
import { UserForm, UserList, UserView } from './Users';
import ReviewModeration from './Reviews';
import Reports from './Reports';
import Account from '../store/Account';

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
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
        <Route path="resenas" element={<ReviewModeration />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="perfil" element={<Account admin />} />
      </Route>
    </Routes>
  );
}
