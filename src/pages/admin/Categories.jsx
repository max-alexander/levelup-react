import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import AlertMessage from '../../components/common/AlertMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useCollection } from '../../hooks/useCollection';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../context/ToastContext';
import { db } from '../../data/db';
import { categoryRules } from '../../utils/validators';
import { sanitizeText } from '../../utils/format';

const ICONS = ['fa-tag', 'fa-burst', 'fa-compass', 'fa-hat-wizard', 'fa-futbol', 'fa-flag-checkered', 'fa-stairs', 'fa-crosshairs', 'fa-seedling', 'fa-puzzle-piece', 'fa-chess', 'fa-music'];

export function CategoryList() {
  const categories = useCollection(db.categories);
  const games = useCollection(db.games);
  const { notify } = useToast();
  const [toDelete, setToDelete] = useState(null);
  const countOf = name => games.filter(game => game.category === name).length;

  const confirmDelete = () => {
    db.categories.remove(toDelete.id);
    notify('Categoría eliminada', toDelete.name, 'info');
    setToDelete(null);
  };

  return (
    <>
      <PageHeader kicker="CATÁLOGO" title="Categorías" text="Las categorías se reflejan automáticamente en la tienda y sus filtros.">
        <Link className="btn btn-primary" to="/admin/categorias/nueva"><i className="fa-solid fa-plus me-2" />Nueva categoría</Link>
      </PageHeader>
      <div className="surface-card">
        <div className="table-responsive">
          <table className="table app-table align-middle">
            <thead><tr><th>Categoría</th><th>Descripción</th><th>Productos</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>
              {categories.map(category => {
                const count = countOf(category.name);
                return (
                  <tr key={category.id}>
                    <td><i className={`fa-solid ${category.icon || 'fa-tag'} me-2 text-info`} /><strong>{category.name}</strong></td>
                    <td className="text-secondary">{category.description}</td>
                    <td>{count}</td>
                    <td className="text-end text-nowrap">
                      <Link className="btn btn-sm btn-outline-warning me-1" to={`/admin/categorias/${category.id}/editar`} aria-label={`Editar ${category.name}`}><i className="fa-solid fa-pen" /></Link>
                      <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Eliminar ${category.name}`} disabled={count > 0} title={count ? 'No se puede eliminar una categoría en uso' : undefined} onClick={() => setToDelete(category)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal show={Boolean(toDelete)} title="Eliminar categoría" message={`¿Quieres eliminar “${toDelete?.name}”?`} confirmLabel="Eliminar" onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />
    </>
  );
}

export function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const existing = id ? db.categories.getById(id) : null;
  const { values, errors, handleChange, validate } = useForm(existing ?? { name: '', description: '', icon: 'fa-tag' }, categoryRules);
  const [error, setError] = useState('');

  const handleSubmit = event => {
    event.preventDefault();
    setError('');
    if (!validate()) return;
    const name = sanitizeText(values.name);
    if (db.categories.getAll().some(category => category.name.toLowerCase() === name.toLowerCase() && category.id !== existing?.id)) {
      setError('Ya existe una categoría con ese nombre.');
      return;
    }
    const data = { name, description: sanitizeText(values.description), icon: values.icon };
    if (existing) {
      db.categories.update(existing.id, data);
      // Al renombrar, los productos asociados se actualizan.
      if (existing.name !== name) {
        db.games.getAll().filter(game => game.category === existing.name).forEach(game => db.games.update(game.id, { category: name }));
      }
    } else {
      db.categories.create(data);
    }
    notify('Categoría guardada', name, 'success');
    navigate('/admin/categorias');
  };

  if (id && !existing) return <AlertMessage message="La categoría no existe." />;

  return (
    <>
      <PageHeader kicker="CATÁLOGO" title={existing ? 'Editar categoría' : 'Nueva categoría'}>
        <Link className="btn btn-soft" to="/admin/categorias"><i className="fa-solid fa-arrow-left me-2" />Volver</Link>
      </PageHeader>
      <form className="surface-card form-narrow" noValidate onSubmit={handleSubmit}>
        <AlertMessage message={error} />
        <div className="d-grid gap-3">
          <FormField label="Nombre" name="name" value={values.name} onChange={handleChange} error={errors.name} required maxLength={30} />
          <FormField as="textarea" rows={2} label="Descripción" name="description" value={values.description} onChange={handleChange} error={errors.description} maxLength={120} />
          <div>
            <span className="form-label d-block">Ícono</span>
            <div className="icon-picker" role="radiogroup" aria-label="Ícono">
              {ICONS.map(icon => (
                <button key={icon} type="button" role="radio" aria-checked={values.icon === icon} aria-label={icon} className={values.icon === icon ? 'active' : ''} onClick={() => handleChange({ target: { name: 'icon', value: icon } })}>
                  <i className={`fa-solid ${icon}`} />
                </button>
              ))}
            </div>
          </div>
          {existing && <small className="text-secondary">Al renombrar una categoría, los productos asociados también se actualizan.</small>}
          <button type="submit" className="btn btn-primary">Guardar categoría</button>
        </div>
      </form>
    </>
  );
}
