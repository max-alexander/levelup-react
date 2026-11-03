import { useState } from 'react';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import PageHeader from '../../components/common/PageHeader';
import { useForm } from '../../hooks/useForm';
import { contactRules } from '../../utils/validators';

export default function Contact() {
  const { values, errors, handleChange, validate, setValues } = useForm({ name: '', email: '', message: '' }, contactRules);
  const [sent, setSent] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    if (!validate()) return;
    setSent(`Gracias ${values.name.trim()}, responderemos a ${values.email.trim()} dentro de 24 horas.`);
    setValues({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-5">
      <PageHeader kicker="AYUDA" title="Contacto" text="¿Tienes dudas sobre un pedido o un juego? Escríbenos." />
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="surface-card d-grid gap-3" noValidate onSubmit={handleSubmit}>
            <AlertMessage message={sent} type="success" onClose={() => setSent('')} />
            <FormField label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required />
            <FormField label="Correo" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} required />
            <FormField as="textarea" rows={5} label="Mensaje" name="message" value={values.message} onChange={handleChange} error={errors.message} required maxLength={500} hint={`${values.message.length}/500`} />
            <button type="submit" className="btn btn-primary">Enviar mensaje</button>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="surface-card h-100">
            <h5>Canales de atención</h5>
            <p className="text-secondary"><i className="fa-solid fa-envelope me-2" />soporte@levelup.cl</p>
            <p className="text-secondary"><i className="fa-solid fa-location-dot me-2" />Santiago, Chile</p>
            <p className="text-secondary mb-0"><i className="fa-solid fa-clock me-2" />Lunes a sábado, 10:00 a 20:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
