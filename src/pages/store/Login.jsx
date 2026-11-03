import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { loginRules } from '../../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, errors, handleChange, validate } = useForm({ email: '', password: '' }, loginRules);
  const [error, setError] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      const user = login(values.email, values.password);
      navigate(location.state?.from ?? (user.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="auth-card mx-auto">
        <span className="section-kicker">CUENTA</span>
        <h2 className="mb-3">Iniciar sesión</h2>
        <AlertMessage message={error} onClose={() => setError('')} />
        <form noValidate onSubmit={handleSubmit} className="d-grid gap-3">
          <FormField label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required autoComplete="email" />
          <FormField label="Contraseña" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} required autoComplete="current-password" />
          <button type="submit" className="btn btn-primary">Ingresar</button>
        </form>
        <p className="mt-3 mb-2 text-secondary">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
        <div className="login-help"><small>Admin: admin@game.com / 123456<br />Cliente: user@game.com / 123456</small></div>
      </div>
    </div>
  );
}
