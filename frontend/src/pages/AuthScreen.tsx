import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Shield, User as UserIcon, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  mode: 'login' | 'register' | 'admin-login';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ mode }) => {
  const { signIn, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const role = mode === 'admin-login' ? 'admin' : 'student';
      signIn(`token-${Date.now()}`, {
        id: `usr-${Date.now()}`,
        name: name || (role === 'admin' ? 'Staff Administrator' : 'Student Learner'),
        email: email || `${role}@edutech.io`,
        role,
        avatar: (name || 'U').charAt(0).toUpperCase(),
        joinedDate: 'November 2026',
      });
      setLoading(false);
      navigate(role === 'admin' ? '/admin' : '/');
    }, 400);
  };

  const handleDemo = (role: 'student' | 'admin') => {
    quickDemoLogin(role);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen bg-[#0d0d10] text-gray-200 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#16161b] border border-[#26262e] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 backdrop-blur-xl">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-950/30 mb-1">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Edu<span className="text-amber-500">Tech</span> Portal
          </h1>
          <p className="text-xs text-gray-400">
            {mode === 'admin-login'
              ? 'Staff & Administrator Portal'
              : mode === 'register'
              ? 'Create your Student Account'
              : 'Sign in to access your coding assessment'}
          </p>
        </div>

        {/* Tab switchers between Student & Staff */}
        <div className="flex bg-[#1f1f26] p-1 rounded-xl border border-[#2d2d38] text-xs font-medium">
          <Link
            to="/login"
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Student Sign In
          </Link>
          <Link
            to="/admin/login"
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              mode === 'admin-login'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Staff / Admin
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder={mode === 'admin-login' ? 'admin@edutech.io' : 'student@novithra.tech'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1b1b22] border border-[#2e2e38] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-md flex items-center justify-center space-x-1.5 ${
              mode === 'admin-login'
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
            }`}
          >
            <span>{loading ? 'Signing in...' : mode === 'register' ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-2 border-t border-[#26262e] space-y-2">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Instant Demo Access (No Typing Required):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemo('student')}
              className="px-3 py-2 rounded-xl bg-[#1f1f26] hover:bg-[#282832] border border-[#2d2d38] text-[11px] text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <UserIcon className="w-3 h-3 text-amber-400" />
              <span>Demo Student</span>
            </button>
            <button
              onClick={() => handleDemo('admin')}
              className="px-3 py-2 rounded-xl bg-[#1f1f26] hover:bg-[#282832] border border-[#2d2d38] text-[11px] text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Demo Staff</span>
            </button>
          </div>
        </div>

        {/* Footer switch */}
        <div className="text-center text-xs text-gray-400">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <Link to="/login" className="text-amber-400 hover:underline">
                Sign In
              </Link>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-400 hover:underline">
                Create one
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
