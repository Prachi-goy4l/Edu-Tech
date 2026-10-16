import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, CircleHelp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { EmptyState, ErrorBanner, LoadingRows } from '../components/Feedback.jsx';

export function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (query.trim()) params.set('search', query.trim());
    if (difficulty) params.set('difficulty', difficulty);
    try {
      const result = await api(`/problems?${params.toString()}`);
      setProblems(result.problems || []);
      setTotal(result.pagination?.total || 0);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [query, difficulty]);

  useEffect(() => {
    const timeout = window.setTimeout(loadProblems, 250);
    return () => window.clearTimeout(timeout);
  }, [loadProblems]);

  return (
    <div className="listing-page">
      <div className="page-heading-row">
        <div><div className="eyebrow eyebrow-muted"><span className="eyebrow-dot" /> THE PRACTICE LIBRARY</div><h1>Find your next <span className="heading-accent">challenge.</span></h1><p>One good problem can teach you something new.</p></div>
        <div className="library-count"><span>{String(total).padStart(2, '0')}</span><small>PROBLEMS<br />AVAILABLE</small></div>
      </div>
      <div className="filter-bar">
        <label className="search-box"><Search size={17} /><input placeholder="Search problems or topics..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="select-wrap"><span>DIFFICULTY</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><ChevronDown size={15} /></label>
      </div>
      {error && <ErrorBanner message={error} onRetry={loadProblems} />}
      <section className="panel library-panel">
        <div className="table-head"><span>PROBLEM</span><span>DIFFICULTY</span><span>TOPICS</span><span /></div>
        {loading ? <LoadingRows count={4} /> : problems.length ? problems.map((problem, index) => (
          <ProblemLibraryRow key={problem.id || problem.slug} problem={problem} index={index} />
        )) : <EmptyState icon={<Search size={20} />} title="No matching problems" text="Try another search or change the difficulty filter." />}
      </section>
      <div className="library-footnote"><CircleHelp size={15} /> More problems will appear here as your library grows.</div>
    </div>
  );
}

function ProblemLibraryRow({ problem, index }) {
  const difficulty = (problem.difficulty || 'easy').toLowerCase();
  return (
    <Link className="library-row" to={`/problems/${problem.slug}`}>
      <span className="table-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="table-problem"><strong>{problem.title}</strong><small>{problem.slug}</small></span>
      <span><span className={`difficulty difficulty-${difficulty}`}>{difficulty}</span></span>
      <span className="topic-list">{problem.tags?.slice(0, 3).map((tag) => <i key={tag}>{tag}</i>) || <i>General</i>}</span>
      <span className="row-arrow"><ArrowUpRight size={16} /></span>
    </Link>
  );
}
