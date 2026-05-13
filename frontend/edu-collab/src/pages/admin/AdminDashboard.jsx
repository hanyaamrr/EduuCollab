import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [creatorRequests, setCreatorRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);

  const fetchData = async () => {
    try {
      const creatorsRes = await api.get('/api/admin/creators/pending');
      const groupsRes = await api.get('/api/admin/groups/pending');
      setCreatorRequests(creatorsRes.data);
      setGroupRequests(groupsRes.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreator = async (id, approve) => {
    try {
      await api.post(`/api/admin/creators/handle/${id}?approve=${approve}`);
      setCreatorRequests(creatorRequests.filter(req => req.id !== id));
    } catch (err) {
      alert("Error processing creator request");
    }
  };

  const handleGroup = async (id, approve) => {
    try {
      await api.post(`/api/admin/groups/handle/${id}?approve=${approve}`);
      setGroupRequests(groupRequests.filter(req => req.id !== id));
    } catch (err) {
      alert("Error processing group request");
    }
  };

  return (
      <div className="space-y-12 px-6 py-8 max-w-5xl mx-auto md:px-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage pending approvals for Creators and Groups.</p>
        </div>

        {/* --- CREATOR REQUESTS SECTION --- */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Pending Group Creators</h2>
          {creatorRequests.length === 0 ? (
              <p className="text-slate-500 italic">No pending creator requests.</p>
          ) : (
              <div className="grid gap-4">
                {creatorRequests.map(req => (
                    <div key={req.id} className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{req.username}</h3>
                        <p className="text-slate-500 text-sm">{req.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCreator(req.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle size={24} />
                        </button>
                        <button onClick={() => handleCreator(req.id, false)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={24} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </section>

        {/* --- GROUP REQUESTS SECTION --- */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Pending Study Groups</h2>
          {groupRequests.length === 0 ? (
              <p className="text-slate-500 italic">No pending group requests.</p>
          ) : (
              <div className="grid gap-4">
                {groupRequests.map(req => (
                    <div key={req.id} className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{req.name}</h3>
                        <p className="text-slate-500 text-sm">Subject: {req.subject} | Type: {req.meetingType}</p>
                        <p className="text-slate-400 text-xs mt-1 truncate max-w-md">{req.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleGroup(req.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle size={24} />
                        </button>
                        <button onClick={() => handleGroup(req.id, false)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={24} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </section>
      </div>
  );
};

export default AdminDashboard;