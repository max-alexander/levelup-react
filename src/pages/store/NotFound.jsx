import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';

export default function NotFound() {
  return (
    <div className="container py-5">
      <EmptyState icon="fa-ghost" title="Página no encontrada" text="La ruta que buscas no existe.">
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
      </EmptyState>
    </div>
  );
}
