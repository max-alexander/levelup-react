import { useState } from 'react';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import PageHeader from '../../components/common/PageHeader';
import AddressFields from '../../components/store/AddressFields';
import OrderHistory from '../../components/store/OrderHistory';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../data/db';
import { addressRules, validateEmail, validateName } from '../../utils/validators';

const profileRules = { name: v => validateName(v), lastName: v => validateName(v, 'El apellido'), email: validateEmail, ...addressRules };

/** Perfil del usuario (tienda) y del administrador (panel): datos personales + historial. */
export default function Account({ admin = false }) {
  const { user, updateProfile } = useAuth();
  const orders = useCollection(db.orders).filter(order => order.userId === user.id);
  const { values, errors, handleChange, validate } = useForm({ name: user.name, lastName: user.lastName, email: user.email, street: '', apartment: '', region: '', comuna: '', notes: '', ...user.address }, profileRules);
  const [message, setMessage] = useState(null);

  const handleSubmit = event => {
    event.preventDefault();
    if (!validate()) return;
    try {
      const { name, lastName, email, street, apartment, region, comuna, notes } = values;
      updateProfile({ name: name.trim(), lastName: lastName.trim(), email, address: { street: street.trim(), apartment, region, comuna, notes } });
      setMessage({ type: 'success', text: 'Tus cambios fueron guardados.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }
  };

  return (
    <div className={admin ? '' : 'container py-5'}>
      <PageHeader kicker="CUENTA" title={admin ? 'Perfil' : 'Mi cuenta'} text={`Rol: ${user.role === 'admin' ? 'Administrador' : 'Cliente'}`} />
      <div className="row g-4">
        <div className={admin ? 'col-xl-7' : 'col-lg-6'}>
          <form className="surface-card" noValidate onSubmit={handleSubmit}>
            <AlertMessage message={message?.text} type={message?.type} onClose={() => setMessage(null)} />
            <div className="row g-3 mb-3">
              <FormField className="col-md-6" label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
              <FormField className="col-md-6" label="Apellidos" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} required />
              <FormField className="col-12" label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
            </div>
            <AddressFields values={values} errors={errors} onChange={handleChange} />
            <button type="submit" className="btn btn-primary w-100 mt-4">Guardar cambios</button>
          </form>
        </div>
        {!admin && (
          <div className="col-lg-6">
            <div className="surface-card">
              <span className="section-kicker">HISTORIAL</span>
              <h4>Mis compras</h4>
              <OrderHistory orders={orders} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
