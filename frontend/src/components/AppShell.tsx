import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  History,
  ShieldCheck,
  Trophy,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/problems/')) return 'Problem Workspace';
    if (location.pathname.startsWith('/problems')) return 'Problem Library';
    if (location.pathname.startsWith('/submissions')) return 'Submissions History';
    if (location.pathname.startsWith('/leaderboard')) return 'Candidate Leaderboard';
    if (location.pathname.startsWith('/admin')) return 'Admin Portal';
    return 'Student Dashboard';
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-200 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-white">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#141417] border-r border-[#232328] flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#232328] space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md shadow-orange-950/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight flex items-center">
                Edu<span className="text-amber-500">Tech</span>
                <span className="ml-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                Novithra Assessment
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 font-mono">
                {isAdmin ? 'Staff Workspace' : 'Learning Hub'}
              </div>

              {isAdmin ? (
                <>
                  <SidebarLink
                    to="/admin"
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Admin Portal"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/problems"
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Problem Library"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/leaderboard"
                    icon={<Trophy className="w-4 h-4" />}
                    label="Leaderboard"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/submissions"
                    icon={<History className="w-4 h-4" />}
                    label="All Submissions"
                    onClick={() => setMobileOpen(false)}
                  />
                </>
              ) : (
                <>
                  <SidebarLink
                    to="/"
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="Overview"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/problems"
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Problem Library"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/leaderboard"
                    icon={<Trophy className="w-4 h-4" />}
                    label="Leaderboard"
                    onClick={() => setMobileOpen(false)}
                  />
                  <SidebarLink
                    to="/submissions"
                    icon={<History className="w-4 h-4" />}
                    label="My Submissions"
                    onClick={() => setMobileOpen(false)}
                  />
                </>
              )}
            </div>

            {/* Quick Practice Tip Card */}
            <div className="bg-[#1b1b20] border border-[#2c2c34] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Practice</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Solve 1 challenge a day to boost algorithmic logic and accuracy.
              </p>
              <Link
                to="/problems/two-sum"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium pt-1"
              >
                <span>Jump to Two Sum</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-[#232328] space-y-3">
          <div className="flex items-center justify-between bg-[#19191e] border border-[#2a2a30] rounded-xl p-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.avatar || user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user?.name || 'Candidate'}
                </span>
                <span className="text-[10px] text-gray-400 capitalize">
                  {user?.role || 'student'} account
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-[#282830] text-gray-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#141417]/80 backdrop-blur-md border-b border-[#232328] px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg bg-[#1f1f25] border border-[#2d2d35] text-gray-300 md:hidden"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="hover:text-gray-200">EduTech</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <span className="font-semibold text-white">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] font-mono font-medium text-gray-400 bg-[#1b1b20] border border-[#2b2b34] px-2.5 py-1 rounded-md hidden sm:inline-block">
              {todayLabel}
            </span>

            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {user?.role || 'student'}
            </span>

            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-[#22222a] border border-transparent hover:border-[#33333d] transition-all hidden md:flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f11]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
          isActive
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-sm'
            : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a20]'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
