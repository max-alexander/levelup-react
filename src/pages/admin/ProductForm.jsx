import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import PageHeader from '../../components/common/PageHeader';
import GameImage from '../../components/common/GameImage';
import { useForm } from '../../hooks/useForm';
import { useCollection } from '../../hooks/useCollection';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { PLATFORMS } from '../../data/seed';
import { productRules } from '../../utils/validators';
import { sanitizeText } from '../../utils/format';

const EMPTY = { title: '', category: '', platform: '', price: '', stock: '', discount: '0', rating: '4', image: '', description: '', featured: false };

/** Formulario único para "Nuevo producto" y "Editar producto" (depende de si hay :id). */
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const categories = useCollection(db.categories).map(category => category.name);
  const existing = id ? db.games.getById(id) : null;
  const { values, errors, handleChange, validate } = useForm(
    existing ? { ...EMPTY, ...existing, price: String(existing.price), stock: String(existing.stock), discount: String(existing.discount ?? 0), rating: String(existing.rating) } : EMPTY,
    productRules(categories)
  );
  const [error, setError] = useState('');

  if (id && !existing) {
    return <AlertMessage message="El producto no existe." />;
  }

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    const title = sanitizeText(values.title);
    const duplicate = db.games.getAll().some(game => game.title.toLowerCase() === title.toLowerCase() && game.platform === values.platform && String(game.id) !== String(id));
    if (duplicate) {
      setError('Ya existe ese juego para la misma plataforma.');
      return;
    }
    const data = {
      title, category: values.category, platform: values.platform,
      price: Number(values.price), stock: Number(values.stock), discount: Number(values.discount || 0), rating: Number(values.rating),
      image: values.image.trim(), description: sanitizeText(values.description), featured: Boolean(values.featured)
    };
    const saved = existing ? db.games.update(existing.id, data) : db.games.create({ ...data, source: 'manual' });
    notify(existing ? 'Producto actualizado' : 'Producto creado', saved.title, 'success');
    navigate(`/admin/productos/${saved.id}`);
  };

  return (
    <>
      <PageHeader kicker="INVENTARIO" title={existing ? 'Editar producto' : 'Nuevo producto'}>
        <Link className="btn btn-soft" to="/admin/productos"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
      </PageHeader>
      <div className="row g-4">
        <div className="col-xl-8">
          <form className="surface-card" noValidate onSubmit={handleSubmit}>
            <AlertMessage message={error} />
            <div className="row g-3">
              <FormField className="col-md-8" label="Título" name="title" value={values.title} onChange={handleChange} error={errors.title} required maxLength={80} />
              <FormField className="col-md-4" as="select" label="Categoría" name="category" value={values.category} onChange={handleChange} error={errors.category} required>
                <option value="">Selecciona</option>
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </FormField>
              <FormField className="col-md-4" as="select" label="Plataforma" name="platform" value={values.platform} onChange={handleChange} error={errors.platform} required>
                <option value="">Selecciona</option>
                {PLATFORMS.map(platform => <option key={platform} value={platform}>{platform}</option>)}
              </FormField>
              <FormField className="col-md-4" label="Precio (CLP)" name="price" type="number" min={990} max={120000} value={values.price} onChange={handleChange} error={errors.price} required />
              <FormField className="col-md-4" label="Stock" name="stock" type="number" min={0} max={999} value={values.stock} onChange={handleChange} error={errors.stock} required />
              <FormField className="col-md-4" label="Descuento (%)" name="discount" type="number" min={0} max={90} value={values.discount} onChange={handleChange} error={errors.discount} />
              <FormField className="col-md-4" label="Valoración (1-5)" name="rating" type="number" min={1} max={5} step={0.1} value={values.rating} onChange={handleChange} error={errors.rating} required />
              <FormField className="col-md-4 d-flex align-items-end" type="checkbox" label="Producto destacado" name="featured" value={values.featured} onChange={handleChange} />
              <FormField className="col-12" label="URL de imagen (opcional)" name="image" type="url" placeholder="https://..." value={values.image} onChange={handleChange} error={errors.image} />
              <FormField className="col-12" as="textarea" rows={4} label="Descripción" name="description" value={values.description} onChange={handleChange} error={errors.description} required maxLength={240} hint={`${values.description.length}/240`} />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-4">Guardar producto</button>
          </form>
        </div>
        <div className="col-xl-4">
          <div className="surface-card">
            <small className="section-kicker">VISTA PREVIA</small>
            <GameImage key={values.image} game={{ title: values.title || 'Nuevo producto', platform: values.platform, image: values.image }} className="preview-image mt-2" fit="contain" />
            <h5 className="mt-3 mb-1">{values.title || 'Título del producto'}</h5>
            <small className="text-secondary">{values.category || 'Categoría'} · {values.platform || 'Plataforma'}</small>
          </div>
        </div>
      </div>
    </>
  );
}
