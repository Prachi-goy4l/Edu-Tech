export function StatCard({ icon, iconTone, label, value, note }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconTone}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </div>
  );
}
