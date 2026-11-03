import { Link } from 'react-router-dom';

export default function CategoryCard({ category, count, active = false }) {
  return (
    <Link to={`/categorias/${encodeURIComponent(category.name)}`} className={`category-card ${active ? 'active' : ''}`}>
      <span className="category-icon"><i className={`fa-solid ${category.icon || 'fa-tag'}`} aria-hidden="true" /></span>
      <strong>{category.name}</strong>
      <small>{count} {count === 1 ? 'juego' : 'juegos'}</small>
    </Link>
  );
}
