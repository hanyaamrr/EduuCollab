import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Users, LayoutDashboard, X } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

// Matches StudyGroupCreateDTO
const schema = yup.object().shape({
  name: yup.string().required('Name is required').max(50),
  subject: yup.string().required('Subject is required'),
  description: yup.string().required('Description is required').max(500),
  maxMembers: yup.number().required().min(2).max(100),
  meetingType: yup.string().required().oneOf(['Online', 'Offline']),
  meetingSchedule: yup.string().required('Schedule is required'),
  location: yup.string().required('Location/Link is required'),
});

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { maxMembers: 10, meetingType: 'Offline' }
  });

  useEffect(() => {
    // Fetch groups created by this user
    // api.get(`/StudyGroup/creator/${user?.id}`).then(res => setMyGroups(res.data));
  }, [user]);

  const onSubmit = async (data) => {
    try {
      // Append CreatorId from token claims
      const payload = { ...data, creatorId: user.id };
      await api.post('/StudyGroup', payload);
      setIsModalOpen(false);
      reset();
      // Re-fetch groups here
      alert("Group created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create group.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Creator Hub</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your study groups and pending requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all"
        >
          <Plus size={20} /> Create New Group
        </button>
      </div>

      {/* Grid of My Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myGroups.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white border-dashed">
            <LayoutDashboard size={48} className="mx-auto mb-4 opacity-30" />
            <p>You haven't created any groups yet.</p>
          </div>
        ) : (
          myGroups.map(group => (
            <div 
              key={group.id} onClick={() => navigate(`/group/${group.id}`)}
              className="cursor-pointer bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 hover:-translate-y-1 transition-all group"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600">{group.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{group.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1 text-sm text-slate-500"><Users size={16} /> {group.maxMembers} Max</span>
                <span className="text-blue-600 font-semibold text-sm">Manage &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal (Glassmorphism Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-[2rem] shadow-2xl border border-white p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Create Study Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Group Name</label>
                  <input {...register('name')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.name?.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Subject</label>
                  <input {...register('subject')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                  <p className="text-red-500 text-xs mt-1 ml-1">{errors.subject?.message}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Description</label>
                <textarea {...register('description')} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.description?.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Type</label>
                  <select {...register('meetingType')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Max Members</label>
                  <input type="number" {...register('maxMembers')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Schedule</label>
                  <input {...register('meetingSchedule')} placeholder="e.g. Mon/Wed 4PM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Location / Meeting Link</label>
                <input {...register('location')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-70">
                {isSubmitting ? 'Creating...' : 'Launch Study Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;