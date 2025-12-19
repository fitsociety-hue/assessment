import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Users } from 'lucide-react';
import './styles/index.css';

// Lazy load components
const AdminDashboard = React.lazy(() => import('./components/admin/Dashboard'));
const HRDashboard = React.lazy(() => import('./components/admin/HRDashboard'));
const EvaluationConfig = React.lazy(() => import('./components/admin/EvaluationConfig'));
const EvaluationForm = React.lazy(() => import('./components/evaluation/EvaluationForm'));
const Login = React.lazy(() => import('./components/auth/Login'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, currentRole }) => {
  if (!currentRole) return <Navigate to="/login" replace />;
  if (allowedRole && allowedRole !== currentRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [userRole, setUserRole] = useState(null); // 'admin', 'hr', or null

  // Check LocalStorage on init
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <HashRouter>
      <div className="app-shell">
        {userRole && <Header userRole={userRole} onLogout={handleLogout} />}

        <main className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <React.Suspense fallback={<div className="loading">시스템 로딩중...</div>}>
            <Routes>
              <Route path="/login" element={userRole ? <Navigate to={userRole === 'admin' ? '/admin' : '/hr'} /> : <Login onLogin={handleLogin} />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute currentRole={userRole} allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/config" element={
                <ProtectedRoute currentRole={userRole} allowedRole="admin">
                  <EvaluationConfig />
                </ProtectedRoute>
              } />

              {/* HR Routes */}
              <Route path="/hr" element={
                <ProtectedRoute currentRole={userRole} allowedRole="hr">
                  <HRDashboard />
                </ProtectedRoute>
              } />

              {/* Evaluation Form (Accessible to Admin for Demo) */}
              <Route path="/eval/:id?" element={
                <ProtectedRoute currentRole={userRole}>
                  <EvaluationForm />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to={userRole ? (userRole === 'admin' ? '/admin' : '/hr') : '/login'} replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </HashRouter>
  );
}

function Header({ userRole, onLogout }) {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-logo">
        <LayoutDashboard size={24} />
        <span>HR Insight Pro</span>
        <span className="badge" style={{ marginLeft: '0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}>
          {userRole === 'admin' ? 'Administrator' : 'HR Manager'}
        </span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {userRole === 'admin' && (
          <>
            <Link to="/admin" className={`btn ${location.pathname === '/admin' ? 'btn-primary' : 'btn-ghost'}`}>대시보드</Link>
            <Link to="/eval/example" className={`btn ${location.pathname.includes('/eval') ? 'btn-primary' : 'btn-ghost'}`}>평가표 예시</Link>
          </>
        )}
        <button onClick={onLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', color: 'var(--text-sub)' }}>
          <LogOut size={16} /> 로그아웃
        </button>
      </nav>
    </header>
  );
}

export default App;
