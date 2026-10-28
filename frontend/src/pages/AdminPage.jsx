import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, RefreshCw, Users } from 'lucide-react';
import { api, jsonBody, timeAgo } from '../api.js';
import { ErrorBanner, PageLoader } from '../components/Feedback.jsx';
import { StatCard } from '../components/StatCard.jsx';

const VERDICTS = [
  ['all', 'All results'],
  ['accepted', 'Accepted'],
  ['wrong_answer', 'Wrong answer'],
  ['time_limit_exceeded', 'Time limit exceeded'],
  ['compilation_error', 'Compilation error'],
  ['runtime_error', 'Runtime error'],
  ['internal_error', 'Internal error'],
];

export function AdminPage({ token }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [verdict, setVerdict] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (verdict !== 'all') params.set('verdict', verdict);
      setData(await api(`/submissions/admin?${params}`, { token }));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [page, token, verdict]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data && !error) return <PageLoader label="Loading admin workspace" />;

  const stats = data?.stats;
  const acceptedRate = stats?.submissions
    ? `${Math.round((stats.acceptedSubmissions / stats.submissions) * 100)}%`
    : '0%';

  return (
    <div className="listing-page admin-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow eyebrow-muted"><span className="eyebrow-dot" /> ADMINISTRATION</div>
          <h1>Admin <span className="heading-accent">workspace.</span></h1>
          <p>Manage coding challenges and review submissions across your student community.</p>
        </div>
        <button className="button admin-refresh" type="button" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'refresh-spinning' : ''} /> Refresh data
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="stats-grid admin-stats">
        <StatCard icon={<Activity size={18} />} iconTone="blue" label="All submissions" value={stats?.submissions ?? '—'} note="Across all students" />
        <StatCard icon={<CheckCircle2 size={18} />} iconTone="green" label="Accepted rate" value={acceptedRate} note={`${stats?.acceptedSubmissions ?? 0} accepted attempts`} />
        <StatCard icon={<Users size={18} />} iconTone="violet" label="Student accounts" value={stats?.students ?? '—'} note="Registered learners" />
        <StatCard icon={<BookOpen size={18} />} iconTone="amber" label="Problems" value={stats?.problems ?? '—'} note="Available in the library" />
      </div>

      <section className="panel admin-submissions-panel">
        <div className="admin-section-heading">
          <div><span className="section-kicker">STUDENT ACTIVITY</span><h2>All submissions</h2></div>
          <label className="admin-filter">
            <span className="sr-only">Filter by verdict</span>
            <select value={verdict} onChange={(event) => { setVerdict(event.target.value); setPage(1); }}>
              {VERDICTS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
        <div className="admin-table-scroll">
          <div className="admin-table-head"><span>STUDENT</span><span>PROBLEM</span><span>RESULT</span><span>SCORE</span><span>LANGUAGE</span><span>SUBMITTED</span></div>
          {loading && !data
            ? <div className="admin-table-message">Loading submissions…</div>
            : data?.submissions?.length
              ? data.submissions.map((submission) => (
                <div className="admin-table-row" key={submission.id}>
                  <div className="admin-student-cell"><strong>{submission.student.name}</strong><small>{submission.student.email}</small></div>
                  <div className="admin-problem-cell"><strong>{submission.problem.title}</strong><small>{submission.problem.difficulty}</small></div>
                  <span className={`verdict-label ${submission.verdict === 'accepted' ? 'verdict-pass' : 'verdict-other'}`}>{submission.verdict.replaceAll('_', ' ')}</span>
                  <strong className="admin-score">{submission.score}%</strong>
                  <span className="admin-language">ID {submission.languageId}</span>
                  <span className="admin-date">{timeAgo(submission.createdAt)}</span>
                </div>
              ))
              : <div className="admin-table-message">{error ? 'Submission data could not be loaded.' : 'No submissions match this filter yet.'}</div>}
        </div>
        <div className="admin-pagination">
          <span>{data?.pagination?.total ?? 0} submission{data?.pagination?.total === 1 ? '' : 's'}</span>
          <div>
            <button type="button" className="icon-button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ArrowLeft size={16} /></button>
            <span>Page {page} of {Math.max(1, data?.pagination?.pages || 1)}</span>
            <button type="button" className="icon-button" aria-label="Next page" disabled={loading || page >= (data?.pagination?.pages || 1)} onClick={() => setPage((current) => current + 1)}><ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

    </div>
  );
}
