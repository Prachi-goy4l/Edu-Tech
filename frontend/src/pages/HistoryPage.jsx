import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, Copy, Gauge, History, Zap } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, formatMemory, timeAgo } from '../api.js';
import { ExecutionResult } from '../components/ExecutionResult.jsx';
import { ErrorBanner, EmptyState, LoadingRows, PageLoader } from '../components/Feedback.jsx';
import { StatCard } from '../components/StatCard.jsx';

export function HistoryPage({ token }) {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api('/submissions?limit=50', { token });
      setSubmissions(result.submissions || []);
      setPagination(result.pagination);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="listing-page history-page">
      <div className="page-heading-row">
        <div><div className="eyebrow eyebrow-muted"><span className="eyebrow-dot" /> YOUR PROGRESS</div><h1>Every attempt <span className="heading-accent">counts.</span></h1><p>Look how far you’ve come, one solution at a time.</p></div>
        <div className="library-count"><span>{String(pagination?.total || 0).padStart(2, '0')}</span><small>TOTAL<br />ATTEMPTS</small></div>
      </div>
      {error && <ErrorBanner message={error} onRetry={load} />}
      <section className="panel history-panel">
        <div className="history-table-head"><span>PROBLEM</span><span>RESULT</span><span>SCORE</span><span>LANGUAGE ID</span><span>WHEN</span><span /></div>
        {loading ? <LoadingRows count={4} /> : submissions.length ? submissions.map((submission) => (
          <Link className="history-row" key={submission.id} to={`/submissions/${submission.id}`}>
            <div className="history-problem"><span className={`recent-status ${submission.verdict === 'accepted' ? 'status-pass' : 'status-neutral'}`}>{submission.verdict === 'accepted' ? <Check size={14} /> : <Code2 size={14} />}</span><span><strong>{submission.problem?.title || 'Problem'}</strong><small>{submission.problem?.slug || ''}</small></span></div>
            <span className={`verdict-label ${submission.verdict === 'accepted' ? 'verdict-pass' : 'verdict-other'}`}>{submission.verdict.replaceAll('_', ' ')}</span>
            <strong className="history-score">{submission.score}%</strong>
            <span className="history-language">{submission.languageId}</span>
            <span className="history-when">{timeAgo(submission.createdAt)}</span>
            <ArrowUpRight size={16} className="history-arrow" />
          </Link>
        )) : <EmptyState icon={<History size={20} />} title="No submissions yet" text="Submit a solution to your first problem and your history will show up here." action={<Link className="text-link" to="/problems">Browse problems <ArrowRight size={14} /></Link>} />}
      </section>
      {!loading && pagination?.total > submissions.length && <p className="pagination-note">Showing the most recent {submissions.length} of {pagination.total} submissions.</p>}
    </div>
  );
}

export function SubmissionPage({ token }) {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/submissions/${encodeURIComponent(id)}`, { token })
      .then((result) => setSubmission(result.submission))
      .catch((requestError) => setError(requestError.message));
  }, [id, token]);

  if (error) return <ErrorBanner message={error} onRetry={() => window.location.reload()} />;
  if (!submission) return <PageLoader label="Loading submission" />;

  return (
    <div className="listing-page submission-detail-page">
      <Link to="/submissions" className="back-link"><ArrowLeft size={15} /> All submissions</Link>
      <div className="page-heading-row detail-heading">
        <div><div className="eyebrow eyebrow-muted"><span className="eyebrow-dot" /> SUBMISSION DETAIL</div><h1>{submission.problem?.title || 'Your submission'}</h1><p>Submitted {timeAgo(submission.createdAt)}</p></div>
        <span className={`verdict-label detail-verdict ${submission.verdict === 'accepted' ? 'verdict-pass' : 'verdict-other'}`}>{submission.verdict.replaceAll('_', ' ')}</span>
      </div>
      <div className="detail-stats">
        <StatCard icon={<Check size={18} />} iconTone="green" label="Score" value={`${submission.score}%`} note="Tests passed" />
        <StatCard icon={<Gauge size={18} />} iconTone="blue" label="Runtime" value={submission.runtime == null ? '—' : `${submission.runtime} s`} note="Across test cases" />
        <StatCard icon={<Zap size={18} />} iconTone="violet" label="Memory" value={formatMemory(submission.memory)} note="Peak memory" />
        <StatCard icon={<Code2 size={18} />} iconTone="amber" label="Language ID" value={submission.languageId} note="Judge0 language" />
      </div>
      <section className="panel detail-code-panel">
        <div className="section-heading"><div><span className="section-kicker">YOUR SOLUTION</span><h2>Submitted code</h2></div><button className="icon-link" onClick={() => navigator.clipboard?.writeText(submission.sourceCode || '')} title="Copy source code" aria-label="Copy source code"><Copy size={16} /></button></div>
        <pre className="source-code"><code>{submission.sourceCode}</code></pre>
      </section>
      <section className="panel detail-results-panel"><div className="section-heading"><div><span className="section-kicker">EXECUTION REPORT</span><h2>Test results</h2></div></div><ExecutionResult result={submission} /></section>
    </div>
  );
}
