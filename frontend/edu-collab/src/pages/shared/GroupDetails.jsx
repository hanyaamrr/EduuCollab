import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, FileText, UserPlus, Upload, Send } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussion');

  // State for tabs
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [materials, setMaterials] = useState([]);

  // Fetch Discussion Messages
  useEffect(() => {
    if (activeTab === 'discussion') {
      api.get(`/Discussion/group/${id}`).then(res => setMessages(res.data)).catch(console.error);
    }
  }, [id, activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const res = await api.post('/Discussion', { content: messageInput, studyGroupId: id });
      setMessages([...messages, res.data]);
      setMessageInput('');
    } catch (err) { console.error("Failed to send", err); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('File', file);
    formData.append('StudyGroupId', id);
    formData.append('Tag', '#Shared');

    try {
      await api.post('/Material/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert("Upload successful!");
      // Re-fetch materials here
    } catch (err) { console.error("Upload failed", err); }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white/50 mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Advanced Algorithms Study Group</h1>
        <p className="text-slate-500 mt-2">Preparing for the final exam. We focus on dynamic programming and graphs.</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'discussion', label: 'Discussion', icon: MessageSquare },
          { id: 'materials', label: 'Materials', icon: FileText },
          // Only show requests tab to Group Creators
          ...(user?.role === 'GroupCreator' ? [{ id: 'requests', label: 'Join Requests', icon: UserPlus }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white/50 text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content Area */}
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm min-h-[50vh]">

        {/* DISCUSSION TAB */}
        {activeTab === 'discussion' && (
          <div className="flex flex-col h-[50vh]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 mt-10">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.senderId == user?.id ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-slate-400 ml-1 mb-1">{msg.senderName}</span>
                    <div className={`px-5 py-3 rounded-2xl max-w-[70%] ${msg.senderId == user?.id ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Input Box */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} type="text" placeholder="Type a message..." className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors"><Send size={20} /></button>
            </form>
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Shared Files</h2>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                <Upload size={18} /> Upload File
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="text-center py-12 text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>No materials uploaded yet.</p>
            </div>
          </div>
        )}

        {/* REQUESTS TAB (Creator Only) */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Pending Approvals</h2>
            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">John Doe (Student)</p>
                <p className="text-sm text-slate-500">Requested to join 2 hours ago</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-colors">Accept</button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors">Deny</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GroupDetails;