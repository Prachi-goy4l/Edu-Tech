import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { GOOGLE_CLIENT_ID } from '../config';
import { Code2, Shield, User as UserIcon, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthScreenProps {
  mode: 'login' | 'register' | 'admin-login';
}

function parseGoogleJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT payload', err);
    return null;
  }
}

const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ mode }) => {
  const { signIn, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = (response: any) => {
    setGoogleLoading(true);
    if (!response || !response.credential) {
      setGoogleLoading(false);
      return;
    }

    const payload = parseGoogleJwt(response.credential);
    const role: UserRole = mode === 'admin-login' ? 'admin' : 'student';

    const googleUser = {
      id: payload?.sub || `google-${Date.now()}`,
      name: payload?.name || 'Google User',
      email: payload?.email || `${role}@google.com`,
      role,
      avatar: payload?.picture || (payload?.name ? payload.name.charAt(0) : 'G'),
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    signIn(response.credential, googleUser);
    setGoogleLoading(false);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear previous render if any
          googleBtnRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 340,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });

          setGoogleReady(true);
        } catch (e) {
          console.warn('Google Identity Services init warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const handleCustomGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.info('Google One-Tap is not displayed, reason:', notification.getNotDisplayedReason());
        }
      });
    } else {
      alert('Google Sign-In is initializing. Please wait a moment.');
    }
  };

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

        {/* Continue with Google Section */}
        <div className="space-y-3">
          {/* Official Google Identity Button Mount */}
          <div
            ref={googleBtnRef}
            className="w-full flex justify-center items-center min-h-[42px] overflow-hidden rounded-xl border border-[#2c2c36]"
          />

          {/* Styled Custom Fallback Button (visible if GIS is loading or styled click) */}
          {!googleReady && (
            <button
              type="button"
              onClick={handleCustomGoogleClick}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1e1e26] hover:bg-[#282834] border border-[#2e2e3a] hover:border-[#454555] text-xs font-semibold text-white transition-all shadow-sm flex items-center justify-center space-x-2.5 group cursor-pointer"
            >
              <GoogleLogo className="w-4 h-4 shrink-0" />
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-[#26262e] w-full" />
            <span className="bg-[#16161b] px-3 text-[10px] text-gray-500 uppercase font-mono tracking-wider shrink-0">
              or continue with email
            </span>
            <div className="border-t border-[#26262e] w-full" />
          </div>
        </div>

        {/* Standard Form */}
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
              className="px-3 py-2 rounded-xl bg-[#1f1f26] hover:bg-[#282832] border border-[#2d2d38] text-[11px] text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <UserIcon className="w-3 h-3 text-amber-400" />
              <span>Demo Student</span>
            </button>
            <button
              onClick={() => handleDemo('admin')}
              className="px-3 py-2 rounded-xl bg-[#1f1f26] hover:bg-[#282832] border border-[#2d2d38] text-[11px] text-gray-300 hover:text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
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
