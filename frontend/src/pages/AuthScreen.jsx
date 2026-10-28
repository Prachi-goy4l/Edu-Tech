import { useState } from 'react';
import { ArrowRight, Code2, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, jsonBody } from '../api.js';

export function AuthScreen({ mode, onSuccess }) {
  const isRegister = mode === 'register';
  const isAdminLogin = mode === 'admin-login';
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api(`/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        body: jsonBody(isRegister ? { name, email, password } : { email, password }),
      });
      if (isAdminLogin && result.student?.role !== 'admin') {
        setError('This account does not have administrator access.');
        return;
      }
      onSuccess(result);
      navigate(location.state?.from?.pathname || (result.student?.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-art-grid" />
        <Link className="brand brand-light" to="/login">
          <span className="brand-mark"><Code2 size={21} strokeWidth={2.5} /></span>
          <span>codelab<span className="brand-period">.</span></span>
        </Link>
        <div className="auth-art-copy">
          <div className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Think in code.<br /><span>Grow without limits.</span></h1>
          <p>A focused space to practice, experiment, and become the developer you want to be.</p>
          <div className="auth-code-card">
            <div className="code-card-top"><span /><span /><span /><small>solution.py</small></div>
            <pre><i>01</i> <b>def</b> <em>keep_learning</em>():{'\n'}<i>02</i>   skills = <strong>build</strong>(practice){'\n'}<i>03</i>   <b>return</b> skills.<em>grow</em>()</pre>
            <span className="code-cursor" />
          </div>
        </div>
        <div className="auth-art-footer"><span>BUILT FOR THE CURIOUS</span><span>01 — 03</span></div>
      </div>
      <section className="auth-panel">
        <div className="auth-mobile-brand">
          <span className="brand-mark"><Code2 size={20} /></span> codelab<span className="brand-period">.</span>
        </div>
        <div className="auth-form-wrap">
          <span className="auth-overline">{isRegister ? 'GET STARTED' : isAdminLogin ? 'ADMINISTRATOR ACCESS' : 'WELCOME BACK'}</span>
          <h2>{isRegister ? 'Create your account' : isAdminLogin ? 'Sign in to your workspace.' : 'Pick up where you left off.'}</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Your next big idea starts with a first line.' : isAdminLogin ? 'Manage problems and review student progress.' : 'Your coding journey is waiting.'}
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="field-label">
                Your name
                <input autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
              </label>
            )}
            <label className="field-label">
              Email address
              <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="field-label">
              Password
              <input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={isRegister ? 8 : undefined} />
            </label>
            {error && <div className="alert-error" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'One moment…' : isRegister ? 'Create account' : isAdminLogin ? 'Admin sign in' : 'Sign in'}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          <p className="auth-switch">
            {isAdminLogin
              ? <>Student account? <Link to="/login">Student sign in</Link></>
              : isRegister
                ? <>Already have an account? <Link to="/login">Sign in</Link></>
                : <>New to CodeLab? <Link to="/register">Create an account</Link></>}
          </p>
          {!isRegister && !isAdminLogin && <p className="auth-switch admin-login-link"><Link to="/admin/login">Administrator sign in</Link></p>}
        </div>
        <div className="auth-legal">A little progress each day adds up to big results.</div>
      </section>
    </main>
  );
}
