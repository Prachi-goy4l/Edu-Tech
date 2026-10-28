import { BookOpen, ChevronRight, Code2, History, LayoutDashboard, LogOut, Menu, X, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).toUpperCase();

export function AppShell({ student, onSignOut, mobileNavOpen, setMobileNavOpen }) {
  const location = useLocation();
  const isAdmin = student?.role === 'admin';
  const pageTitle = location.pathname.startsWith('/problems/')
    ? 'Problem workspace'
    : location.pathname.startsWith('/problems')
      ? 'Problem library'
      : location.pathname.startsWith('/submissions')
        ? 'Submissions'
        : location.pathname.startsWith('/admin')
          ? 'Admin workspace'
          : 'Overview';

  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <Link to={isAdmin ? '/admin' : '/'} className="brand sidebar-brand">
          <span className="brand-mark"><Code2 size={20} strokeWidth={2.5} /></span>
          <span>codelab<span className="brand-period">.</span></span>
        </Link>
        <div className="side-label">{isAdmin ? 'ADMIN WORKSPACE' : 'WORKSPACE'}</div>
        <nav className="side-nav">
          {isAdmin
            ? <>
              <NavItem to="/admin" icon={<ShieldCheck size={18} />} label="Admin dashboard" end />
              <NavItem to="/problems" icon={<BookOpen size={18} />} label="Problem library" />
            </>
            : <>
              <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Overview" end />
              <NavItem to="/problems" icon={<BookOpen size={18} />} label="Problems" />
              <NavItem to="/submissions" icon={<History size={18} />} label="Submissions" />
            </>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Zap size={17} fill="currentColor" /></div>
            <strong>{isAdmin ? 'Build a better library' : 'Keep your streak alive'}</strong>
            <span>{isAdmin ? 'Create thoughtful challenges for every learner.' : 'A small step today makes a big difference tomorrow.'}</span>
            <Link to={isAdmin ? '/admin' : '/problems'}>{isAdmin ? 'Open admin tools' : 'Find a challenge'} <ArrowRight size={13} /></Link>
          </div>
          <div className="profile-row">
            <div className="avatar">{student?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
            <div className="profile-copy"><strong>{student?.name || (isAdmin ? 'Administrator' : 'Student')}</strong><span>{isAdmin ? 'Administrator' : 'Student'} account</span></div>
            <button className="icon-button profile-exit" onClick={onSignOut} aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobileNavOpen && <button className="mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />}
      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle menu">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">{TODAY_LABEL}</span>
            <div className="topbar-divider" />
            <div className="topbar-avatar">{student?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>© 2026 CodeLab</span><span>Built for curious minds <span className="footer-heart">✳</span></span></footer>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `side-link ${isActive ? 'side-link-active' : ''}`}>
      {icon}<span>{label}</span>{label === 'Problems' && <span className="nav-count">01</span>}
    </NavLink>
  );
}
