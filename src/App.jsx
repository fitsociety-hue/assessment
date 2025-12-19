import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings } from 'lucide-react';
import './styles/index.css';

// Lazy load components to optimize build
const AdminDashboard = React.lazy(() => import('./components/admin/Dashboard'));
const EvaluationForm = React.lazy(() => import('./components/evaluation/EvaluationForm'));

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-logo">
            <LayoutDashboard size={24} />
            HR Insight Pro
          </div>
          <nav>
            <Link to="/" className="btn btn-outline" style={{ marginRight: '1rem' }}>Admin Dashboard</Link>
            <Link to="/eval/example" className="btn btn-primary">Evaluation Portal</Link>
          </nav>
        </header>

        <main className="container">
          <React.Suspense fallback={<div className="loading">Loading System...</div>}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/eval/:id?" element={<EvaluationForm />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
