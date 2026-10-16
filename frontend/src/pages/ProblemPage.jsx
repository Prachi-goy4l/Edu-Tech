import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Code2, Command, FileCode2, Gauge, History, Play, Send, Terminal, Zap } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, editorLanguage, jsonBody, timeAgo } from '../api.js';
import { ExecutionResult } from '../components/ExecutionResult.jsx';
import { EmptyState, ErrorBanner, PageLoader } from '../components/Feedback.jsx';

export function ProblemPage({ token }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [languageId, setLanguageId] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionMode, setExecutionMode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [consoleOpen, setConsoleOpen] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      api(`/problems/${encodeURIComponent(slug)}`),
      api('/submissions/languages'),
    ]).then(([problemResponse, languageResponse]) => {
      if (!active) return;
      const nextProblem = problemResponse.problem;
      const availableLanguages = languageResponse.languages || [];
      const nextLanguages = nextProblem.mode === 'function'
        ? availableLanguages.filter((language) => language.functionSupported === true)
        : availableLanguages;
      setProblem(nextProblem);
      setLanguages(nextLanguages);
      const suggested = nextLanguages.find((language) => /python/i.test(language.name))
        || nextLanguages.find((language) => /javascript/i.test(language.name))
        || nextLanguages[0];
      if (suggested) {
        setLanguageId(String(suggested.id));
        const starter = nextProblem.starterCode?.[editorLanguage(suggested.name)];
        setCode(starter || defaultStarter(
          suggested.name,
          nextProblem.mode,
          nextProblem.functionName,
        ));
      } else {
        setLanguageId('');
        setCode('');
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  const selectedLanguage = languages.find((language) => String(language.id) === languageId);
  const monacoLanguage = editorLanguage(selectedLanguage?.name);

  function changeLanguage(value) {
    setLanguageId(value);
    const language = languages.find((item) => String(item.id) === value);
    const starter = problem?.starterCode?.[editorLanguage(language?.name)];
    setCode(starter || defaultStarter(
      language?.name,
      problem?.mode,
      problem?.functionName,
    ));
    setResult(null);
  }

  async function executeCode(mode) {
    setExecuting(true);
    setExecutionMode(mode);
    setError('');
    setConsoleOpen(true);
    setResult(null);
    try {
      const payload = {
        problemSlug: slug,
        languageId: Number(languageId),
        sourceCode: code,
      };
      const response = await api(mode === 'submit' ? '/submissions' : '/submissions/run', {
        method: 'POST',
        token: mode === 'submit' ? token : undefined,
        body: jsonBody(payload),
      });
      const submission = response.submission || response;
      setResult(submission);
      if (mode === 'submit' && submission.id) {
        window.setTimeout(() => navigate(`/submissions/${submission.id}`), 1200);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExecuting(false);
      setExecutionMode('');
    }
  }

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!executing && languageId) executeCode('run');
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [code, executing, languageId, slug]);

  if (loading) return <PageLoader label="Loading problem workspace" />;
  if (error && !problem) return <ErrorBanner message={error} onRetry={() => window.location.reload()} />;
  if (!problem) return null;
  const difficulty = (problem.difficulty || 'easy').toLowerCase();

  return (
    <div className="workspace-page">
      <div className="workspace-topline">
        <Link to="/problems" className="back-link"><ArrowLeft size={15} /> All problems</Link>
        <div className="workspace-breadcrumb">PRACTICE <ChevronRight size={13} /> {problem.slug.toUpperCase()}</div>
        <button className="icon-button workspace-help" title="Problem help" aria-label="Problem help"><CircleHelp size={17} /></button>
      </div>
      <div className="workspace-layout">
        <section className="problem-pane">
          <div className="problem-pane-tabs">
            <button className={activeTab === 'description' ? 'pane-tab active' : 'pane-tab'} onClick={() => setActiveTab('description')}><BookOpen size={15} /> Description</button>
            <button className={activeTab === 'submissions' ? 'pane-tab active' : 'pane-tab'} onClick={() => setActiveTab('submissions')}><History size={15} /> Recent</button>
          </div>
          {activeTab === 'description' ? (
            <div className="problem-description">
              <div className="problem-title-line"><h1>{problem.title}</h1><span className={`difficulty difficulty-${difficulty}`}>{difficulty}</span></div>
              <div className="problem-meta"><span><FileCode2 size={14} /> {problem.tags?.join(' · ') || 'Problem solving'}</span><span><Gauge size={14} /> 30 min</span></div>
              <div className="description-body"><p>{problem.description}</p></div>
              {problem.mode === 'function' && (
                <div className="function-note">
                  <strong>Implement <code>Solution.{problem.functionName}</code></strong>
                  <p>Write the method and return its result. The platform handles input and calls your method with each test case.</p>
                </div>
              )}
              {problem.constraints?.length > 0 && (
                <section className="description-section"><h3>Constraints</h3><ul>{problem.constraints.map((constraint, index) => <li key={index}>{constraint}</li>)}</ul></section>
              )}
              {problem.sampleTests?.map((test, index) => (
                <section className="sample-card" key={index}>
                  <div className="sample-heading"><h3>Example {index + 1}</h3><span>PUBLIC TEST</span></div>
                  {problem.mode === 'function' ? (
                    <>
                      <div className="sample-pair"><strong>Arguments</strong><pre>{JSON.stringify(test.args, null, 2)}</pre></div>
                      <div className="sample-pair"><strong>Expected</strong><pre>{JSON.stringify(test.expected, null, 2)}</pre></div>
                    </>
                  ) : (
                    <>
                      <div className="sample-pair"><strong>Input</strong><pre>{test.input}</pre></div>
                      <div className="sample-pair"><strong>Output</strong><pre>{test.expectedOutput}</pre></div>
                    </>
                  )}
                </section>
              ))}
              <div className="hidden-note"><span className="hidden-lock">⌑</span> Additional hidden tests are used when you submit.</div>
            </div>
          ) : <RecentProblemSubmissions token={token} slug={slug} />}
        </section>
        <section className="editor-pane">
          <div className="editor-toolbar">
            <div className="editor-file"><span className="file-dot" /> solution.<span>{fileExtension(selectedLanguage?.name)}</span><ChevronDown size={14} /></div>
            <label className="language-select">
              <Code2 size={14} />
              <select value={languageId} onChange={(event) => changeLanguage(event.target.value)} disabled={!languages.length}>
                {!languages.length && <option value="">No supported languages</option>}
                {languages.map((language) => <option key={language.id} value={language.id}>{language.name}</option>)}
              </select>
              <ChevronDown size={13} />
            </label>
            <button className="icon-button editor-tool" title="Editor settings" aria-label="Editor settings"><Command size={15} /></button>
          </div>
          <div className="monaco-wrap">
            {languages.length ? <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace",
                lineHeight: 23,
                padding: { top: 18 },
                scrollBeyondLastLine: true,
                automaticLayout: true,
                tabSize: 4,
                roundedSelection: false,
                renderLineHighlight: 'gutter',
                overviewRulerBorder: false,
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
              loading={<div className="editor-loading"><Code2 size={18} /> Loading editor…</div>}
            /> : (
              <div className="editor-loading">
                {problem.mode === 'function'
                  ? 'Function-style problems currently support Python 3 and Node.js.'
                  : 'No programming languages are available.'}
              </div>
            )}
          </div>
          <div className={`console-panel ${consoleOpen ? 'console-open' : ''}`}>
            <button className="console-heading" onClick={() => setConsoleOpen(!consoleOpen)}>
              <span><Terminal size={15} /> CONSOLE</span><ChevronDown size={15} className={consoleOpen ? '' : 'chevron-collapsed'} />
            </button>
            {consoleOpen && (
              <div className="console-content">
                {error && <div className="console-error" role="alert">{error}</div>}
                {executing && <div className="console-wait"><span className="loading-spinner" /> {executionMode === 'submit' ? 'Running hidden test suite…' : 'Running public tests…'}</div>}
                {!executing && result && <ExecutionResult result={result} />}
                {!executing && !result && !error && <div className="console-empty"><Play size={15} /> Run your code to see the output here.</div>}
              </div>
            )}
          </div>
          <div className="editor-footer">
            <div className="editor-hints"><span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run</span><span className="saved-indicator"><span /> Ready</span></div>
            <div className="editor-actions">
              <button className="button button-run" onClick={() => executeCode('run')} disabled={executing || !languageId}>
                {executing && executionMode === 'run' ? <span className="loading-spinner small" /> : <Play size={14} fill="currentColor" />}
                Run
              </button>
              <button className="button button-submit" onClick={() => executeCode('submit')} disabled={executing || !languageId}>
                {executing && executionMode === 'submit' ? <span className="loading-spinner small" /> : <Send size={14} />}
                Submit solution
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function defaultStarter(name = '', mode = 'stdin', functionName = 'solve') {
  if (mode === 'function') {
    if (/python/i.test(name)) {
      return `class Solution:\n    def ${functionName}(self, *args):\n        # Write your solution here\n        pass\n`;
    }
    if (/javascript|node/i.test(name)) {
      return `class Solution {\n  ${functionName}(...args) {\n    // Write your solution here\n  }\n}\n`;
    }
    return '';
  }
  if (/python/i.test(name)) return 'import sys\n\na, b = map(int, sys.stdin.read().split())\nprint(a + b)\n';
  if (/javascript|node/i.test(name)) return "const fs = require('fs');\nconst [a, b] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(a + b);\n";
  if (/java/i.test(name)) return 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println(scanner.nextInt() + scanner.nextInt());\n    }\n}\n';
  if (/c\+\+/i.test(name)) return '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}\n';
  return '// Write your solution here\n';
}

function fileExtension(name = '') {
  if (/python/i.test(name)) return 'py';
  if (/javascript|node/i.test(name)) return 'js';
  if (/typescript/i.test(name)) return 'ts';
  if (/java/i.test(name)) return 'java';
  if (/c\+\+/i.test(name)) return 'cpp';
  if (/c#/i.test(name)) return 'cs';
  return 'txt';
}

function RecentProblemSubmissions({ token, slug }) {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/submissions?problemSlug=${encodeURIComponent(slug)}&limit=8`, { token })
      .then((result) => setSubmissions(result.submissions || []))
      .catch((requestError) => setError(requestError.message));
  }, [slug, token]);

  return (
    <div className="recent-problem-submissions">
      <span className="section-kicker">YOUR ATTEMPTS</span><h2>Recent submissions</h2>
      {error ? <div className="inline-error">{error}</div> : submissions.length ? submissions.map((submission) => (
        <Link className="problem-attempt" key={submission.id} to={`/submissions/${submission.id}`}>
          <span className={`recent-status ${submission.verdict === 'accepted' ? 'status-pass' : 'status-neutral'}`}>
            {submission.verdict === 'accepted' ? <Check size={14} /> : <Code2 size={14} />}
          </span>
          <span><strong>{submission.verdict.replaceAll('_', ' ')}</strong><small>{timeAgo(submission.createdAt)}</small></span>
          <b>{submission.score}%</b><ChevronRight size={15} />
        </Link>
      )) : <EmptyState icon={<History size={20} />} title="No attempts yet" text="Your submissions for this problem will show up here." />}
    </div>
  );
}
