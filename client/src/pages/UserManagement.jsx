import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, UserPlus, Shield, Trash2, Edit3, CheckCircle } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN: { color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-900/50' },
  MANAGER: { color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-900/50' },
  TECHNICIAN: { color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-900/50' },
  AUDITOR: { color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-900/50' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'TECHNICIAN', passwordHash: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users', newUser);
      setShowCreate(false);
      setNewUser({ name: '', email: '', role: 'TECHNICIAN', passwordHash: '' });
      showToast('User created successfully');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create user');
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role });
      setEditingRole(null);
      showToast('Role updated');
      loadUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/users/${userId}`);
      showToast('User deleted');
      loadUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="text-amber-500" size={24} />
            <span>User Management</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage officers, roles, and access control</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold text-sm shadow-lg">
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <form onSubmit={createUser} className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-4">Create New User</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1">Name</label>
              <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1">Email</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none" placeholder="officer@gov.in" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1">Role</label>
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors">Create</button>
            </div>
          </div>
        </form>
      )}

      {/* User List */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-slate-600 border-b border-slate-800/50 font-mono tracking-wider bg-slate-900/30">
            <tr>
              <th className="px-6 py-3">USER</th>
              <th className="px-6 py-3">EMAIL</th>
              <th className="px-6 py-3">ROLE</th>
              <th className="px-6 py-3">JOINED</th>
              <th className="px-6 py-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.TECHNICIAN;
              return (
                <tr key={user._id} className="border-b border-slate-800/30 table-row-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{user.email}</td>
                  <td className="px-6 py-4">
                    {editingRole === user._id ? (
                      <select defaultValue={user.role} onChange={e => updateRole(user._id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none" autoFocus onBlur={() => setEditingRole(null)}>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="AUDITOR">Auditor</option>
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${roleCfg.bg} ${roleCfg.color} border ${roleCfg.border}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setEditingRole(user._id)} className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-all" title="Change Role">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteUser(user._id)} className="p-1.5 rounded hover:bg-red-900/20 text-slate-500 hover:text-red-400 transition-all" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Legend */}
      <div className="glass-card p-5">
        <h3 className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-3">Role Permissions</h3>
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-amber-400 font-bold mb-1">ADMIN</p>
            <p className="text-slate-500">Full access. Create, transfer, dispose assets. Manage users.</p>
          </div>
          <div>
            <p className="text-cyan-400 font-bold mb-1">MANAGER</p>
            <p className="text-slate-500">Create & transfer assets. View reports. Cannot manage users.</p>
          </div>
          <div>
            <p className="text-emerald-400 font-bold mb-1">TECHNICIAN</p>
            <p className="text-slate-500">Log inspections, maintenance, faults via Field Mode.</p>
          </div>
          <div>
            <p className="text-purple-400 font-bold mb-1">AUDITOR</p>
            <p className="text-slate-500">Read-only access. Verify ledger integrity. View reports.</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-fade-in-up z-50">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
