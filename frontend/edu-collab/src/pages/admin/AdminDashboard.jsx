import { useState, useEffect } from 'react';
import { Users, Library, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        const res = await api.get('/User');
        setUsers(res.data);
      } else {
        // Assume you create a generic get all groups endpoint in StudyGroupController
        // const res = await api.get('/StudyGroup/all');
        // setGroups(res.data);
      }
    } catch (err) { console.error("Failed to fetch data", err); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      try {
        await api.delete(`/User/${id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) { alert("Failed to delete user."); }
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm("Delete this entire study group?")) {
      try {
        await api.delete(`/StudyGroup/${id}`);
        setGroups(groups.filter(g => g.id !== id));
      } catch (err) { alert("Failed to delete group."); }
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="mb-10 flex items-center gap-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><ShieldAlert size={32} /></div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">System Administration</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage platform users and study groups.</p>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'users' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white/60 text-slate-500 hover:bg-white'
          }`}
        >
          <Users size={20} /> Manage Users
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
            activeTab === 'groups' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white/60 text-slate-500 hover:bg-white'
          }`}
        >
          <Library size={20} /> Manage Groups
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50">
        
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-semibold">User ID</th>
                  <th className="pb-4 font-semibold">Username</th>
                  <th className="pb-4 font-semibold">Email</th>
                  <th className="pb-4 font-semibold">Role</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2">#{u.id}</td>
                    <td className="py-4 font-medium">{u.username}</td>
                    <td className="py-4">{u.email}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.role === 0 ? 'bg-purple-100 text-purple-700' : // Admin
                        u.role === 2 ? 'bg-blue-100 text-blue-700' :     // Creator
                        'bg-slate-100 text-slate-700'                    // Student
                      }`}>
                        {u.role === 0 ? 'Admin' : u.role === 2 ? 'Creator' : 'Student'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {/* Prevent Admin from deleting themselves easily */}
                      {u.role !== 0 && (
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="text-center py-12 text-slate-400">
            {/* Same table structure as above, mapped to groups state */}
            <p>Group management table goes here (Maps to StudyGroup array).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;