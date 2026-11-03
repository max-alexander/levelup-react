export default function EmptyState({ icon = 'fa-box-open', title, text, children }) {
  return (
    <div className="empty-state">
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      <h4>{title}</h4>
      {text && <p className="mb-0">{text}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
