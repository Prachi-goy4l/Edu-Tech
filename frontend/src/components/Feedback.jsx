export function EmptyState({ icon, title, text, action }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><strong>{title}</strong><p>{text}</p>{action}</div>;
}

export function ErrorBanner({ message, onRetry }) {
  return <div className="error-banner" role="alert"><span>{message}</span>{onRetry && <button onClick={onRetry}>Try again</button>}</div>;
}

export function LoadingRows({ count = 2 }) {
  return <div className="loading-rows">{Array.from({ length: count }, (_, index) => <div className="skeleton-row" key={index}><span /><span /><span /></div>)}</div>;
}

export function PageLoader({ label }) {
  return <div className="page-loader"><span className="loading-spinner" />{label}…</div>;
}
