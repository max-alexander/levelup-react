export default function StatCard({ label, value, icon, tone = 'primary', hint }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <small className="stat-label">{label}</small>
          <strong className="d-block stat-value">{value}</strong>
        </div>
        <i className={`fa-solid ${icon} stat-icon`} aria-hidden="true" />
      </div>
      {hint && <small className="stat-hint">{hint}</small>}
    </div>
  );
}
