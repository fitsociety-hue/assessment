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
const ProtectedRoute = ({ children, allowedRole, currentUser }) => {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRole && allowedRole !== currentUser.role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [userInfo, setUserInfo] = useState(null); // Object: { role, name, team, position }

  // Check LocalStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
  }, []);

  const handleLogin = (user) => {
    // user object should include role
    setUserInfo(user);
    localStorage.setItem('userInfo', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <HashRouter>
      <div className="app-shell">
        {userInfo && <Header userInfo={userInfo} onLogout={handleLogout} />}

        <main className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <React.Suspense fallback={<div className="loading">시스템 로딩중...</div>}>
            <Routes>
              <Route path="/login" element={userInfo ? <Navigate to={userInfo.role === 'admin' ? '/admin' : (userInfo.role === 'hr' ? '/hr' : '/eval/dashboard')} /> : <Login onLogin={handleLogin} />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute currentUser={userInfo} allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/config" element={
                <ProtectedRoute currentUser={userInfo} allowedRole="admin">
                  <EvaluationConfig />
                </ProtectedRoute>
              } />

              {/* HR Routes */}
              <Route path="/hr" element={
                <ProtectedRoute currentUser={userInfo} allowedRole="hr">
                  <HRDashboard />
                </ProtectedRoute>
              } />

              {/* Evaluation Form (General Access for Authenticated Users) */}
              {/* Note: In real app, we would restrict /eval/:id to specific users. For demo, allow all logged in staff. */}
              <Route path="/eval/:id?" element={
                <ProtectedRoute currentUser={userInfo}>
                  <EvaluationForm currentUser={userInfo} />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to={userInfo ? (userInfo.role === 'admin' ? '/admin' : '/eval/dashboard') : '/login'} replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </HashRouter>
  );
}

function Header({ userInfo, onLogout }) {
  const location = useLocation();

  // Map role to display name
  const roleName = {
    'admin': 'Administrator',
    'hr': 'HR Manager',
    'director': '관장',
    'secgen': '사무국장',
    'leader': '팀장',
    'member': '팀원'
  }[userInfo.role] || userInfo.role;

  return (
    <header className="app-header">
      <div className="app-logo">
        <LayoutDashboard size={24} />
        <span>HR Insight Pro</span>
        <span className="badge" style={{ marginLeft: '0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}>
          {roleName} {userInfo.name ? `(${userInfo.name})` : ''}
        </span>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {userInfo.role === 'admin' && (
          <>
            <Link to="/admin" className={`btn ${location.pathname === '/admin' ? 'btn-primary' : 'btn-ghost'}`}>대시보드</Link>
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
