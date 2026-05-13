import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, LogOut, Search, MapPin, Plus, Hourglass } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const BASE_URL = "http://localhost:5129";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mygroups');

  const [joinedGroups, setJoinedGroups] = useState([]);
  const [sentRequests, setSentRequests] = useState([]); // NEW STATE
  const [allGroups, setAllGroups] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  const token = localStorage.getItem("token");
  const userId = user?.id;

  // Fetch my groups AND my pending requests
  // Fetch my groups AND my pending requests safely
  useEffect(() => {
    if (!userId) return;

    const fetchPersonalData = async () => {
      setLoading(true);
      const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

      try {
        // 1. Fetch Joined Groups safely
        const joinedRes = await fetch(`${BASE_URL}/api/studygroup/MyGroups?userId=${userId}`, { headers });
        if (joinedRes.ok) {
          setJoinedGroups(await joinedRes.json());
        } else {
          throw new Error("Failed to load joined groups");
        }

        // 2. Fetch Pending Requests using the new BULLETPROOF Route Parameter
        const pendingRes = await fetch(`${BASE_URL}/api/studygroup/StudentRequests/${userId}`, { headers });
        if (pendingRes.ok) {
          setSentRequests(await pendingRes.json());
        } else {
          // If this fails, just log it instead of crashing the whole dashboard
          console.warn("Failed to load pending requests, status:", pendingRes.status);
        }

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalData();
  }, [userId, token]);

  // Fetch all groups when Browse tab is opened
  useEffect(() => {
    if (activeTab !== 'browse') return;
    fetch(`${BASE_URL}/api/studygroup/all`, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    })
        .then(res => { if (!res.ok) throw new Error("Failed to load groups"); return res.json(); })
        .then(data => setAllGroups(data))
        .catch(err => console.error(err));
  }, [activeTab]);

  const handleJoinRequest = async (groupId) => {
    setJoiningId(groupId);
    try {
      const res = await fetch(`${BASE_URL}/api/StudyGroup/join`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ StudentId: parseInt(userId), StudyGroupId: parseInt(groupId) }),
      });
      if (!res.ok) throw new Error("Failed to send request");

      // Instantly update the UI: Find the group from the allGroups list and add it to sentRequests
      const requestedGroup = allGroups.find(g => g.id === groupId);
      if (requestedGroup) {
        setSentRequests(prev => [...prev, requestedGroup]);
      }

      alert("Join request sent successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveGroup = async (groupId, e) => {
    e.stopPropagation(); // Prevents the card click from triggering navigation

    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        // 1. Tell the C# backend to delete the membership from the database
        const res = await fetch(`${BASE_URL}/api/StudyGroup/leave/${groupId}/student/${userId}`, {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData || "Failed to leave the group");
        }

        // 2. ONLY remove it from the UI if the backend successfully deleted it
        setJoinedGroups(joinedGroups.filter(g => g.id !== groupId));

        // Optional: Alert the user it worked!
        alert("You have successfully left the group.");

      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredGroups = allGroups.filter(g => {
    const s = search.toLowerCase();
    return (
        g.name?.toLowerCase().includes(s) ||
        g.subject?.toLowerCase().includes(s) ||
        g.location?.toLowerCase().includes(s)
    );
  });

  // HELPER FUNCTIONS FOR BUTTON STATES
  const isJoined = (groupId) => joinedGroups.some(g => g.id === groupId);
  const isPending = (groupId) => sentRequests.some(g => g.id === groupId);

  return (
      <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome, {user?.name || user?.username}</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your study groups and find new ones.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setActiveTab('mygroups')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'mygroups' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/60 text-slate-500 hover:bg-white border border-white/40'}`}>
            My Groups
          </button>
          <button onClick={() => setActiveTab('browse')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'browse' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/60 text-slate-500 hover:bg-white border border-white/40'}`}>
            Browse & Join
          </button>
        </div>

        {/* MY GROUPS TAB */}
        {activeTab === 'mygroups' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-blue-500" /> My Joined Groups
                </h2>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100 text-center">
                      <p className="text-red-600 font-semibold">{error}</p>
                    </div>
                )}

                {!loading && !error && joinedGroups.length === 0 && (
                    <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm text-center">
                      <Search className="mx-auto text-slate-300 mb-3" size={40} />
                      <p className="text-slate-500">You haven't joined any groups yet.</p>
                      <button onClick={() => setActiveTab('browse')} className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors">
                        Browse Groups
                      </button>
                    </div>
                )}

                {!loading && !error && joinedGroups.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {joinedGroups.map(group => (
                          <div key={group.id} onClick={() => navigate(`/group/${group.id}`)} className="group cursor-pointer bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase mb-3 inline-block">{group.subject}</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{group.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mb-4"><Clock size={16} /> {group.meetingSchedule || "TBD"}</p>
                            <div className="text-sm text-slate-400 mb-4">{group.currentMembers} / {group.maxMembers} members</div>
                            <button onClick={(e) => handleLeaveGroup(group.id, e)} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100">
                              <LogOut size={18} /> Leave Group
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>

              {/* SENT REQUESTS UI UPDATED */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="text-orange-500" /> Sent Requests
                </h2>
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50">
                  {sentRequests.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No pending requests.</p>
                  ) : (
                      <div className="space-y-4">
                        {sentRequests.map(req => (
                            <div key={req.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                              <h4 className="font-bold text-slate-700">{req.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">{req.subject}</p>
                              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                                    <Hourglass size={12} /> Pending Approval
                                </span>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* BROWSE & JOIN TAB */}
        {activeTab === 'browse' && (
            <div>
              <div className="relative mb-8 max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="text-slate-400" size={20} />
                </div>
                <input
                    type="text"
                    className="w-full pl-12 pr-6 py-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 transition-all"
                    placeholder="Search by subject, name, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                    <div key={group.id} className="bg-white/70 backdrop-blur-lg p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">{group.subject}</span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${group.meetingType === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{group.meetingType}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{group.name}</h3>
                        <div className="space-y-2 text-sm text-slate-500 mb-6">
                          <div className="flex items-center gap-2"><MapPin size={16} /> {group.location}</div>
                          <div className="flex items-center gap-2"><Users size={16} /> {group.currentMembers} / {group.maxMembers} members</div>
                        </div>
                      </div>

                      {/* BUTTON LOGIC UPDATED HERE */}
                      <button
                          onClick={() => handleJoinRequest(group.id)}
                          disabled={isJoined(group.id) || isPending(group.id) || joiningId === group.id || group.currentMembers >= group.maxMembers}
                          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                              isJoined(group.id) ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed' :
                                  isPending(group.id) ? 'bg-orange-50 text-orange-600 cursor-not-allowed' :
                                      group.currentMembers >= group.maxMembers ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                                          'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                          }`}
                      >
                        {isJoined(group.id) ? 'Already Joined' :
                            isPending(group.id) ? 'Pending Approval' :
                                group.currentMembers >= group.maxMembers ? 'Group Full' :
                                    joiningId === group.id ? 'Sending...' :
                                        <><Plus size={16} /> Request to Join</>}
                      </button>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
};

export default StudentDashboard;