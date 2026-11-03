export function pageList(current, total) {
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('gap-start');
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < total - 1) pages.push('gap-end');
  if (end < total) pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination-wrap" aria-label="Paginación">
      <ul className="pagination justify-content-center flex-wrap">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" aria-label="Anterior" disabled={page === 1} onClick={() => onChange(page - 1)}>
            <i className="fa-solid fa-chevron-left" />
          </button>
        </li>
        {pageList(page, totalPages).map(value => (typeof value === 'string'
          ? <li key={value} className="page-item disabled"><span className="page-link">…</span></li>
          : (
            <li key={value} className={`page-item ${value === page ? 'active' : ''}`}>
              <button type="button" className="page-link" aria-current={value === page ? 'page' : undefined} onClick={() => onChange(value)}>{value}</button>
            </li>
          )))}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" aria-label="Siguiente" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
