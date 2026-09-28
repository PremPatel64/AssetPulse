import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import OutboxBadge from './OutboxBadge';
import { 
  LayoutDashboard, List, ShieldCheck, Wrench, LogOut, PlusCircle, 
  BarChart3, Bell, ChevronRight, Building2, Calendar, Clock, 
  Users, ArrowRightLeft, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const NAV_SECTIONS = [
  {
    title: 'Operations',
    items: [
      { path: '/', label: 'Control Room', icon: LayoutDashboard, roles: null },
      { path: '/notifications', label: 'Alerts & Notifications', icon: Bell, roles: null, badge: true },
      { path: '/assets', label: 'Asset Register', icon: List, roles: null },
      { path: '/assets/new', label: 'Register Asset', icon: PlusCircle, roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    title: 'Lifecycle',
    items: [
      { path: '/maintenance', label: 'Maintenance Schedule', icon: Calendar, roles: null },
      { path: '/field', label: 'Field Mode', icon: Wrench, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
      { path: '/activity', label: 'Activity Timeline', icon: Clock, roles: null },
    ]
  },
  {
    title: 'Governance',
    items: [
      { path: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER', 'AUDITOR'] },
      { path: '/audit', label: 'Ledger Audit', icon: ShieldCheck, roles: ['ADMIN', 'AUDITOR', 'MANAGER'] },
      { path: '/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
    ]
  }
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get('/api/notifications').then(res => {
      setAlertCount(res.data?.summary?.critical || 0);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0B0F14] text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0f172a] border-r border-slate-800/70 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">AssetPulse</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">GOV ASSET MGMT v2.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 overflow-auto space-y-4">
          {NAV_SECTIONS.map(section => {
            const filteredItems = section.items.filter(item => !item.roles || item.roles.includes(user?.role));
            if (filteredItems.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase px-3 mb-1.5">{section.title}</p>
                <div className="space-y-0.5">
                  {filteredItems.map(item => {
                    const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group ${
                          isActive
                            ? 'nav-link-active text-amber-400 font-medium'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <item.icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-cyan-400 transition-colors'} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && alertCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                            {alertCount}
                          </span>
                        )}
                        {isActive && <ChevronRight size={12} className="text-amber-500/50" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-slate-800/70">
          <div className="glass-card p-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-3 w-full flex items-center justify-center space-x-2 py-1.5 rounded-md bg-slate-800/50 hover:bg-red-900/30 text-slate-400 hover:text-red-400 text-xs transition-colors">
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-slate-800/70 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-mono">SYSTEM ONLINE</span>
            <span className="text-slate-700">|</span>
            <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-slate-700">|</span>
            <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center space-x-4">
            <OutboxBadge />
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              {alertCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
