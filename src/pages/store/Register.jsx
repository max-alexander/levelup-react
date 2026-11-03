import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import AddressFields from '../../components/store/AddressFields';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { registerRules } from '../../utils/validators';

const INITIAL = { name: '', lastName: '', email: '', password: '', confirmPassword: '', street: '', region: '', comuna: '', terms: false };

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { values, errors, handleChange, validate } = useForm(INITIAL, registerRules);
  const [error, setError] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      const user = register(values);
      notify('Cuenta creada', `Bienvenido, ${user.name}.`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="auth-card auth-card-wide mx-auto">
        <span className="section-kicker">NUEVA CUENTA</span>
        <h2 className="mb-3">Registro de usuario</h2>
        <AlertMessage message={error} onClose={() => setError('')} />
        <form noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            <FormField className="col-md-6" label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
            <FormField className="col-md-6" label="Apellidos" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} required />
            <FormField className="col-12" label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
            <FormField className="col-md-6" label="Contraseña" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} required hint="Entre 6 y 40 caracteres." />
            <FormField className="col-md-6" label="Confirmar contraseña" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
          </div>
          <h6 className="mt-4">Dirección</h6>
          <AddressFields values={values} errors={errors} onChange={handleChange} showDetails={false} />
          <FormField className="mt-3" type="checkbox" label="Acepto los términos y condiciones" name="terms" value={values.terms} onChange={handleChange} error={errors.terms} />
          <button type="submit" className="btn btn-primary w-100 mt-4">Crear cuenta</button>
        </form>
        <p className="mt-3 mb-0 text-secondary">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
