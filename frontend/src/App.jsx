import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { AuthScreen } from './pages/AuthScreen.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { HistoryPage, SubmissionPage } from './pages/HistoryPage.jsx';
import { ProblemPage } from './pages/ProblemPage.jsx';
import { ProblemsPage } from './pages/ProblemsPage.jsx';

const TOKEN_KEY = 'edu-tech-token';
const USER_KEY = 'edu-tech-user';

function useSession() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const signIn = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.student));
    setToken(session.token);
    setStudent(session.student);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setStudent(null);
  }, []);

  useEffect(() => {
    window.addEventListener('edu-tech:unauthorized', signOut);
    return () => window.removeEventListener('edu-tech:unauthorized', signOut);
  }, [signOut]);

  return { token, student, signIn, signOut };
}

function App() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const requireAuth = (element) => (
    session.token ? element : <Navigate to="/login" replace state={{ from: location }} />
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={session.token
          ? <Navigate to="/" replace />
          : <AuthScreen mode="login" onSuccess={session.signIn} />}
      />
      <Route
        path="/register"
        element={session.token
          ? <Navigate to="/" replace />
          : <AuthScreen mode="register" onSuccess={session.signIn} />}
      />
      <Route
        element={requireAuth(
          <AppShell
            student={session.student}
            onSignOut={() => {
              session.signOut();
              navigate('/login');
            }}
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />,
        )}
      >
        <Route index element={<DashboardPage token={session.token} student={session.student} />} />
        <Route path="problems" element={<ProblemsPage />} />
        <Route path="problems/:slug" element={<ProblemPage token={session.token} />} />
        <Route path="submissions" element={<HistoryPage token={session.token} />} />
        <Route path="submissions/:id" element={<SubmissionPage token={session.token} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
