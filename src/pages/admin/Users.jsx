import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import AddressFields from '../../components/store/AddressFields';
import OrderHistory from '../../components/store/OrderHistory';
import { useCollection } from '../../hooks/useCollection';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { userRules } from '../../utils/validators';
import { formatMoney, sanitizeText } from '../../utils/format';

const RoleBadge = ({ role }) => <span className={`badge ${role === 'admin' ? 'text-bg-warning' : 'text-bg-primary'}`}>{role === 'admin' ? 'Administrador' : 'Cliente'}</span>;

export function UserList() {
  const users = useCollection(db.users);
  const { user: current } = useAuth();
  const { notify } = useToast();
  const [toDelete, setToDelete] = useState(null);

  const confirmDelete = () => {
    db.users.remove(toDelete.id);
    notify('Usuario eliminado', toDelete.email, 'info');
    setToDelete(null);
  };

  return (
    <>
      <PageHeader kicker="CUENTAS" title="Usuarios" text={`${users.length} cuentas registradas`}>
        <Link className="btn btn-primary" to="/admin/usuarios/nuevo"><i className="fa-solid fa-user-plus me-2" />Nuevo usuario</Link>
      </PageHeader>
      <div className="surface-card">
        <div className="table-responsive">
          <table className="table app-table align-middle">
            <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td><RoleBadge role={user.role} /></td>
                  <td className="text-end text-nowrap">
                    <Link className="btn btn-sm btn-outline-info me-1" to={`/admin/usuarios/${user.id}`} aria-label={`Ver ${user.email}`}><i className="fa-solid fa-eye" /></Link>
                    <Link className="btn btn-sm btn-outline-warning me-1" to={`/admin/usuarios/${user.id}/editar`} aria-label={`Editar ${user.email}`}><i className="fa-solid fa-pen" /></Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Eliminar ${user.email}`} disabled={user.id === current?.id} onClick={() => setToDelete(user)}><i className="fa-solid fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal show={Boolean(toDelete)} title="Eliminar usuario" message={`¿Quieres eliminar a ${toDelete?.name}?`} confirmLabel="Eliminar" onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
    </>
  );
}

export function UserView({ historyOnly = false }) {
  const { id } = useParams();
  const user = useCollection(db.users).find(item => String(item.id) === id);
  const orders = useCollection(db.orders).filter(order => String(order.userId) === id);
  if (!user) return <EmptyState icon="fa-user-slash" title="Usuario no encontrado"><Link className="btn btn-primary" to="/admin/usuarios">Volver</Link></EmptyState>;
  const spent = orders.filter(order => order.status === 'pagada').reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <PageHeader kicker="USUARIO" title={historyOnly ? `Historial de compras de ${user.name}` : `${user.name} ${user.lastName}`}>
        <Link className="btn btn-soft" to="/admin/usuarios"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
        {!historyOnly && <Link className="btn btn-soft" to={`/admin/usuarios/${user.id}/historial`}><i className="fa-solid fa-clock-rotate-left me-2" />Historial de compras</Link>}
        <Link className="btn btn-warning" to={`/admin/usuarios/${user.id}/editar`}><i className="fa-solid fa-pen me-2" />Editar usuario</Link>
      </PageHeader>
      <div className="row g-4">
        {!historyOnly && (
          <div className="col-lg-5">
            <div className="surface-card">
              <dl className="row mb-0">
                <dt className="col-5">Correo</dt><dd className="col-7 text-break">{user.email}</dd>
                <dt className="col-5">Rol</dt><dd className="col-7"><RoleBadge role={user.role} /></dd>
                <dt className="col-5">Dirección</dt><dd className="col-7">{user.address?.street || '—'} {user.address?.apartment}</dd>
                <dt className="col-5">Comuna</dt><dd className="col-7">{user.address?.comuna || '—'}, {user.address?.region || '—'}</dd>
                <dt className="col-5">Total comprado</dt><dd className="col-7">{formatMoney(spent)}</dd>
              </dl>
            </div>
          </div>
        )}
        <div className={historyOnly ? 'col-12' : 'col-lg-7'}>
          <div className="surface-card">
            <h5>Historial de compras</h5>
            <OrderHistory orders={orders} linkTo={order => `/admin/ordenes/${order.id}`} />
          </div>
        </div>
      </div>
    </>
  );
}

const EMPTY = { name: '', lastName: '', email: '', password: '', role: 'usuario', street: '', apartment: '', region: '', comuna: '', notes: '' };

export function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const existing = id ? db.users.getById(id) : null;
  const { values, errors, handleChange, validate } = useForm(existing ? { ...EMPTY, ...existing, ...existing.address } : EMPTY, userRules);
  const [error, setError] = useState('');

  if (id && !existing) return <AlertMessage message="El usuario no existe." />;

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    const email = values.email.trim().toLowerCase();
    if (db.users.getAll().some(user => user.email.toLowerCase() === email && user.id !== existing?.id)) {
      setError('El correo ya está registrado.');
      return;
    }
    const data = {
      name: sanitizeText(values.name), lastName: sanitizeText(values.lastName), email, password: values.password, role: values.role,
      address: { street: sanitizeText(values.street), apartment: values.apartment, region: values.region, comuna: values.comuna, notes: values.notes }
    };
    const saved = existing ? db.users.update(existing.id, data) : db.users.create(data);
    notify('Usuario guardado', saved.email, 'success');
    navigate(`/admin/usuarios/${saved.id}`);
  };

  return (
    <>
      <PageHeader kicker="CUENTAS" title={existing ? 'Editar usuario' : 'Nuevo usuario'}>
        <Link className="btn btn-soft" to="/admin/usuarios"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
      </PageHeader>
      <form className="surface-card" noValidate onSubmit={handleSubmit}>
        <AlertMessage message={error} />
        <div className="row g-3 mb-3">
          <FormField className="col-md-6" label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
          <FormField className="col-md-6" label="Apellidos" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} required />
          <FormField className="col-md-6" label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
          <FormField className="col-md-3" label="Contraseña" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} required />
          <FormField className="col-md-3" as="select" label="Rol" name="role" value={values.role} onChange={handleChange} error={errors.role} required>
            <option value="usuario">Cliente</option>
            <option value="admin">Administrador</option>
          </FormField>
        </div>
        <h6>Dirección (opcional)</h6>
        <AddressFields values={values} onChange={handleChange} />
        <button type="submit" className="btn btn-primary w-100 mt-4">Guardar usuario</button>
      </form>
    </>
  );
}
