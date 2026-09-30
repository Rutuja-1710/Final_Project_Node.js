import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import EquipmentList from './pages/EquipmentList.jsx';
import LogMaintenance from './pages/LogMaintenance.jsx';
import OverdueDashboard from './pages/OverdueDashboard.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      {user && (
        <header className="topbar">
          <strong className="brand">Plant Maintenance</strong>
          <nav>
            <NavLink to="/equipment">Equipment</NavLink>
            <NavLink to="/log">Log maintenance</NavLink>
            <NavLink to="/overdue">Overdue</NavLink>
          </nav>
          <div className="who">
            {user.name} <span className={`role role-${user.role}`}>{user.role}</span>
            <button className="btn ghost" onClick={logout}>Sign out</button>
          </div>
        </header>
      )}
      <main className="page">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/equipment" replace /> : <Login />} />
          <Route path="/equipment" element={<Protected><EquipmentList /></Protected>} />
          <Route path="/log" element={<Protected><LogMaintenance /></Protected>} />
          <Route path="/overdue" element={<Protected><OverdueDashboard /></Protected>} />
          <Route path="*" element={<Navigate to={user ? '/equipment' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  );
}
