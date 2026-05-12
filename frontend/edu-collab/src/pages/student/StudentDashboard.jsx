import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, LogOut, Search } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // In a real app, you would fetch these from a specific endpoint like /GroupMember/student/{id}
  useEffect(() => {
    // MOCK DATA for layout demonstration
    setJoinedGroups([
      { id: 1, name: 'Advanced Algorithms', subject: 'CS', nextMeeting: 'Tomorrow, 2:00 PM' }
    ]);
    setPendingRequests([
      { id: 2, name: 'Organic Chemistry Prep', status: 'Pending Approval' }
    ]);
  }, []);

  const handleLeaveGroup = async (groupId, e) => {
    e.stopPropagation(); // Prevent navigating to details
    if (window.confirm("Are you sure you want to leave this group?")) {
      // await api.delete(`/StudyGroup/leave/${groupId}`);
      setJoinedGroups(joinedGroups.filter(g => g.id !== groupId));
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-slate-500 mt-2 text-lg">Here are your active study sessions and requests.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Joined Groups (Takes up 2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-500" /> My Joined Groups
          </h2>
          
          {joinedGroups.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm text-center">
              <Search className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500">You haven't joined any groups yet.</p>
              <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors">
                Browse Groups
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedGroups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="group cursor-pointer bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all"
                >
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase mb-3 inline-block">
                    {group.subject}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{group.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                    <Clock size={16} /> {group.nextMeeting}
                  </p>
                  <button 
                    onClick={(e) => handleLeaveGroup(group.id, e)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                  >
                    <LogOut size={18} /> Leave Group
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pending Requests */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-orange-500" /> Sent Requests
          </h2>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No pending requests.</p>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800">{req.name}</h4>
                  <p className="text-sm text-orange-600 font-semibold mt-1">{req.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;