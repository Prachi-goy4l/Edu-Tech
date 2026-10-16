import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Command, Flame, History, Sparkles, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, timeAgo } from '../api.js';
import { EmptyState, ErrorBanner, LoadingRows } from '../components/Feedback.jsx';
import { StatCard } from '../components/StatCard.jsx';

export function DashboardPage({ token, student }) {
  const [dashboard, setDashboard] = useState(null);
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardData, problemData] = await Promise.all([
        api('/dashboard', { token }),
        api('/problems?limit=5'),
      ]);
      setDashboard(dashboardData);
      setProblems(problemData.problems || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const firstName = student?.name?.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow eyebrow-muted"><span className="eyebrow-dot" /> YOUR LEARNING SPACE</div>
          <h1>Good to see you, {firstName}<span className="wave">✳</span></h1>
          <p>Every problem you solve is progress. Keep going.</p>
        </div>
        <Link to="/problems" className="button button-primary"><Code2 size={17} /> Explore problems <ArrowRight size={16} /></Link>
      </section>
      {error && <ErrorBanner message={error} onRetry={load} />}
      <section className="stats-grid">
        <StatCard icon={<BookOpen size={18} />} iconTone="blue" label="Available problems" value={loading ? '—' : dashboard?.stats?.availableProblems ?? 0} note="Ready when you are" />
        <StatCard icon={<Check size={18} />} iconTone="green" label="Accepted submissions" value={loading ? '—' : dashboard?.stats?.acceptedSubmissions ?? 0} note="Solutions that passed" />
        <StatCard icon={<Terminal size={18} />} iconTone="violet" label="Total attempts" value={loading ? '—' : dashboard?.stats?.submissions ?? 0} note="Every try moves you forward" />
        <div className="streak-card">
          <div className="streak-top"><span className="streak-icon"><Flame size={19} fill="currentColor" /></span><span className="streak-chip"><Sparkles size={12} /> KEEP IT UP</span></div>
          <div className="streak-number">One step<span> at a time</span></div>
          <p>Build your own rhythm. Practice when you can.</p>
          <div className="streak-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="panel problem-panel">
          <div className="section-heading">
            <div><span className="section-kicker">YOUR NEXT CHALLENGE</span><h2>Pick up a problem</h2></div>
            <Link className="text-link" to="/problems">View all <ArrowRight size={15} /></Link>
          </div>
          {loading ? <LoadingRows /> : problems.length ? (
            <div className="compact-problem-list">
              {problems.map((problem, index) => <ProblemRow key={problem.id || problem.slug} problem={problem} index={index} />)}
            </div>
          ) : <EmptyState icon={<BookOpen size={20} />} title="No problems yet" text="Add a problem from the admin account to get started." />}
        </section>
        <section className="panel recent-panel">
          <div className="section-heading">
            <div><span className="section-kicker">YOUR ACTIVITY</span><h2>Recent submissions</h2></div>
            <Link className="icon-link" to="/submissions" aria-label="See all submissions"><ArrowUpRight size={18} /></Link>
          </div>
          {loading ? <LoadingRows count={3} /> : dashboard?.recentSubmissions?.length ? (
            <div className="recent-list">
              {dashboard.recentSubmissions.slice(0, 4).map((submission) => (
                <Link to={`/submissions/${submission.id}`} className="recent-item" key={submission.id}>
                  <div className={`recent-status ${submission.verdict === 'accepted' ? 'status-pass' : 'status-neutral'}`}>
                    {submission.verdict === 'accepted' ? <Check size={15} /> : <Code2 size={15} />}
                  </div>
                  <div className="recent-info"><strong>{submission.problem?.title || 'Problem'}</strong><span>{timeAgo(submission.createdAt)}</span></div>
                  <div className="recent-score"><strong>{submission.score}%</strong><span>{submission.verdict.replaceAll('_', ' ')}</span></div>
                </Link>
              ))}
            </div>
          ) : <EmptyState icon={<History size={20} />} title="Your story starts here" text="Run your first solution and it will show up here." />}
        </section>
      </div>
      <section className="bottom-banner">
        <div className="banner-orbit orbit-one" /><div className="banner-orbit orbit-two" />
        <div className="banner-mark"><Command size={21} /></div>
        <div className="banner-copy"><span>SMALL STEPS. BIG MOMENTUM.</span><h2>The best way to learn is to build.</h2><p>Try something new. Make a mistake. Figure it out. That’s how it clicks.</p></div>
        <Link to="/problems" className="button button-light">Find your next challenge <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}

function ProblemRow({ problem, index }) {
  const difficulty = (problem.difficulty || 'easy').toLowerCase();
  return (
    <Link to={`/problems/${problem.slug}`} className="problem-row">
      <div className="problem-index">{String(index + 1).padStart(2, '0')}</div>
      <div className="problem-row-copy"><strong>{problem.title}</strong><span>{problem.tags?.slice(0, 2).join(' · ') || 'Problem solving'}</span></div>
      <span className={`difficulty difficulty-${difficulty}`}>{difficulty}</span>
      <span className="row-arrow"><ArrowUpRight size={16} /></span>
    </Link>
  );
}
