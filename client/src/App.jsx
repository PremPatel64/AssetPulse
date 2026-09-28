import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/useAuth';

// Pages
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import CreateAsset from './pages/CreateAsset';
import TransferAsset from './pages/TransferAsset';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import FieldMode from './pages/FieldMode';
import Notifications from './pages/Notifications';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import ActivityTimeline from './pages/ActivityTimeline';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
  const user = useAuth((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetList /></ProtectedRoute>} />
        <Route path="/assets/new" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><CreateAsset /></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute><AssetDetail /></ProtectedRoute>} />
        <Route path="/assets/:id/transfer" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><TransferAsset /></ProtectedRoute>} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        {/* Maintenance */}
        <Route path="/maintenance" element={<ProtectedRoute><MaintenanceSchedule /></ProtectedRoute>} />
        
        {/* Activity */}
        <Route path="/activity" element={<ProtectedRoute><ActivityTimeline /></ProtectedRoute>} />
        
        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'AUDITOR']}><Reports /></ProtectedRoute>} />
        
        {/* Audit */}
        <Route path="/audit" element={<ProtectedRoute roles={['ADMIN', 'AUDITOR', 'MANAGER']}><Audit /></ProtectedRoute>} />
        
        {/* Field Mode */}
        <Route path="/field" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TECHNICIAN']}><FieldMode /></ProtectedRoute>} />
        
        {/* User Management */}
        <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
