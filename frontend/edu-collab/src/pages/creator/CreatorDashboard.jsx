import { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { Users, CheckCircle, XCircle, Trash2, PlusCircle, LayoutList, ClipboardList, CalendarPlus, CalendarDays } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-groups');

  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [schedulingGroup, setSchedulingGroup] = useState(null); // Which group's form is open
  const [viewingGroupMeetings, setViewingGroupMeetings] = useState(null); // Which group's meetings are shown
  const [groupMeetings, setGroupMeetings] = useState([]);

  const [meetingForm, setMeetingForm] = useState({ meetingTime: '', meetingType: 'Online', location: '' });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        if (activeTab === 'my-groups') {
          const res = await api.get(`/api/studygroup/CreatedGroups?creatorId=${user.id}`);
          setMyGroups(res.data);
        } else if (activeTab === 'requests') {
          const res = await api.get(`/api/studygroup/CreatorRequests/pending?creatorId=${user.id}`);
          setRequests(res.data);
        } else if (activeTab === 'all-groups') {
          const res = await api.get('/api/studygroup/all');
          setAllGroups(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, [activeTab, user]);

  const handleCreateGroup = async (data) => {
    try {
      const payload = {
        ...data, // This will automatically include the new meetingType from the form!
        maxMembers: parseInt(data.maxMembers, 10),
        creatorId: parseInt(user.id, 10),
        meetingSchedule: meetingSchedule
        // (Removed the hardcoded meetingType from here)
      };

      await api.post('/api/studygroup', payload);
      toast.success('Group request sent to Admin!');

      reset();
      setMeetingSchedule('');

    } catch (err) {
      console.error("BACKEND ERROR:", err.response?.data);
      const errorMessage = err.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : (err.response?.data || "Failed to create group.");

      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteGroup = async (id) => {
    if(!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/api/studygroup/${id}`);
      setMyGroups(myGroups.filter(g => g.id !== id));
      toast.success("Group deleted.");
    } catch (err) {
      toast.error("Failed to delete group.");
    }
  };

  const handleJoinRequest = async (id, accept) => {
    try {
      await api.post(`/api/studygroup/request/${id}?accept=${accept}`);
      setRequests(requests.filter(req => req.id !== id));
      toast.success(accept ? "Student accepted!" : "Student rejected.");
    } catch (err) {
      toast.error("Failed to process request.");
    }
  };

  // --- NEW MEETING ACTIONS ---
  const handleScheduleMeeting = async (e, groupId) => {
    e.preventDefault();
    try {
      const payload = {
        groupId: groupId,
        meetingTime: meetingForm.meetingTime,
        meetingType: meetingForm.meetingType,
        location: meetingForm.location
      };
      await api.post('/api/meeting', payload);
      toast.success('Meeting scheduled successfully!');

      setSchedulingGroup(null); // Close form
      setMeetingForm({ meetingTime: '', meetingType: 'Online', location: '' }); // Reset form

      // If they are currently viewing meetings for this group, refresh the list
      if (viewingGroupMeetings === groupId) {
        fetchMeetings(groupId);
      }
    } catch (err) {
      toast.error(err.response?.data || "Failed to schedule meeting.");
    }
  };

  const fetchMeetings = async (groupId) => {
    try {
      const res = await api.get(`/api/meeting/group/${groupId}`);
      setGroupMeetings(res.data);
      setViewingGroupMeetings(groupId);
    } catch (err) {
      toast.error("Failed to load meetings.");
    }
  };

  return (
      <div className="max-w-6xl mx-auto space-y-8 px-6 pt-8 md:px-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Creator Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your study groups, schedule meetings, and handle requests.</p>
        </div>

        {/* --- TABS --- */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {[
            { id: 'my-groups', icon: Users, label: 'My Groups' },
            { id: 'requests', icon: ClipboardList, label: 'Pending Requests' },
            { id: 'create', icon: PlusCircle, label: 'Create New Group' },
            { id: 'all-groups', icon: LayoutList, label: 'Browse All Groups' }
          ].map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
          ))}
        </div>

        {/* --- TAB CONTENT: MY GROUPS --- */}
        {activeTab === 'my-groups' && (
            <div className="grid md:grid-cols-2 gap-6">
              {myGroups.length === 0 ? <p className="text-slate-500">You haven't created any groups yet.</p> : null}
              {myGroups.map(group => (
                  <div key={group.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{group.name}</h3>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mt-2">
                    {group.subject}
                  </span>
                      </div>
                      <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-4 border-b border-slate-100 pb-4">
                      <button onClick={() => setSchedulingGroup(schedulingGroup === group.id ? null : group.id)} className="flex items-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors">
                        <CalendarPlus size={16} /> {schedulingGroup === group.id ? 'Cancel' : 'Schedule Meeting'}
                      </button>
                      <button onClick={() => viewingGroupMeetings === group.id ? setViewingGroupMeetings(null) : fetchMeetings(group.id)} className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors">
                        <CalendarDays size={16} /> {viewingGroupMeetings === group.id ? 'Hide Meetings' : 'View Meetings'}
                      </button>
                    </div>

                    {/* SCHEDULE MEETING FORM INLINE */}
                    {schedulingGroup === group.id && (
                        <form onSubmit={(e) => handleScheduleMeeting(e, group.id)} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3">
                          <h4 className="font-bold text-slate-700 text-sm">Schedule New Meeting</h4>
                          <input type="datetime-local" required className="w-full px-3 py-2 border rounded-lg text-sm"
                                 value={meetingForm.meetingTime} onChange={e => setMeetingForm({...meetingForm, meetingTime: e.target.value})} />

                          <select className="w-full px-3 py-2 border rounded-lg text-sm" value={meetingForm.meetingType} onChange={e => setMeetingForm({...meetingForm, meetingType: e.target.value})}>
                            <option value="Online">Online</option>
                            <option value="Offline">Offline / In-Person</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>

                          <input type="text" placeholder="Location or Zoom Link" required className="w-full px-3 py-2 border rounded-lg text-sm"
                                 value={meetingForm.location} onChange={e => setMeetingForm({...meetingForm, location: e.target.value})} />

                          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Schedule It</button>
                        </form>
                    )}

                    {/* VIEW MEETINGS INLINE */}
                    {viewingGroupMeetings === group.id && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 space-y-2">
                          <h4 className="font-bold text-blue-800 text-sm">Upcoming Meetings</h4>
                          {groupMeetings.length === 0 ? <p className="text-xs text-blue-600">No meetings scheduled.</p> : null}
                          {groupMeetings.map(m => (
                              <div key={m.id} className="bg-white p-3 rounded border border-blue-200 text-sm">
                                <p className="font-bold text-slate-800">{new Date(m.meetingTime).toLocaleString()}</p>
                                <p className="text-slate-600 text-xs mt-1"><span className="font-semibold">{m.meetingType}:</span> {m.location}</p>
                              </div>
                          ))}
                        </div>
                    )}

                    {/* Enrolled Students Display */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-semibold text-slate-700 text-sm mb-2">Enrolled Students ({group.currentMembers}/{group.maxMembers})</h4>
                      {group.enrolledStudents?.length > 0 ? (
                          <ul className="flex flex-wrap gap-2">
                            {group.enrolledStudents.map((student, idx) => (
                                <li key={idx} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">@{student}</li>
                            ))}
                          </ul>
                      ) : ( <p className="text-xs text-slate-400 italic">No students enrolled yet.</p> )}
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* --- TAB CONTENT: PENDING REQUESTS --- */}
        {activeTab === 'requests' && (
            <div className="max-w-3xl">
              {requests.length === 0 ? <p className="text-slate-500">No pending student requests.</p> : null}
              <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div>
                        <p className="text-sm text-slate-500">Student <span className="font-bold text-slate-800">@{req.studentName}</span> wants to join</p>
                        <p className="font-bold text-blue-600">{req.groupName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleJoinRequest(req.id, true)} className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"><CheckCircle size={18} /> Accept</button>
                        <button onClick={() => handleJoinRequest(req.id, false)} className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"><XCircle size={18} /> Reject</button>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* --- TAB CONTENT: CREATE GROUP --- */}
        {activeTab === 'create' && (
            <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Request New Group</h2>
              <form onSubmit={handleSubmit(handleCreateGroup)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-medium mb-1">Group Name</label><input {...register('name', {required: true})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                  <div><label className="block text-sm font-medium mb-1">Subject</label><input {...register('subject', {required: true})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                  <div><label className="block text-sm font-medium mb-1">Max Members</label><input type="number" {...register('maxMembers', {required: true})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Location / Focus</label><input {...register('location', {required: true})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea {...register('description', {required: true})} rows="3" className="w-full px-4 py-3 bg-slate-50 border rounded-xl"></textarea></div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Time / Schedule</label>
                  <input
                      type="text"
                      placeholder="e.g. Fridays at 4:00 PM"
                      value={meetingSchedule}
                      onChange={(e) => setMeetingSchedule(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Type</label>
                  <select {...register('meetingType', {required: true})} className="w-full px-4 py-3 bg-slate-50 border rounded-xl">
                    <option value="Online">Online</option>
                    <option value="Offline">Offline / In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">{isSubmitting ? 'Submitting...' : 'Submit Request'}</button>
              </form>
            </div>
        )}

        {/* --- TAB CONTENT: ALL GROUPS --- */}
        {activeTab === 'all-groups' && (
            <div className="grid md:grid-cols-3 gap-6">
              {allGroups.map(group => (
                  <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800">{group.name}</h3>
                    <p className="text-sm text-blue-600 mb-2">{group.subject}</p>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-3">{group.description}</p>
                    <div className="text-xs text-slate-400 font-medium">Capacity: {group.currentMembers} / {group.maxMembers}</div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default CreatorDashboard;