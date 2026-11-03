export default function PageHeader({ kicker, title, text, children }) {
  return (
    <div className="section-head mb-4">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h2>{title}</h2>
        {text && <p className="text-secondary mb-0">{text}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
