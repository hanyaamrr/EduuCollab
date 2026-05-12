import { useState } from 'react';
import { Search, MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// MOCK DATA: Replace with an actual Axios call to your /api/StudyGroup endpoints 
// (e.g., api.get(`/StudyGroup/subject?subject=${search}`))
const MOCK_GROUPS = [
  { id: 1, name: 'Advanced Algorithms', subject: 'Computer Science', location: 'Library Room 4', meetingType: 'Offline', maxMembers: 5 },
  { id: 2, name: 'Organic Chemistry Prep', subject: 'Chemistry', location: 'Discord/Zoom', meetingType: 'Online', maxMembers: 10 },
];

const BrowseGroups = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Discover Groups</h1>
        <p className="text-slate-500 mt-2 text-lg">Find the perfect study partners for your next exam.</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-10 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-6 py-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700"
          placeholder="Search by subject, name, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GROUPS.map((group) => (
          <div 
            key={group.id} 
            onClick={() => navigate(`/group/${group.id}`)}
            className="group cursor-pointer bg-white/70 backdrop-blur-lg p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {group.subject}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${group.meetingType === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                {group.meetingType}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{group.name}</h3>
            
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2"><MapPin size={16} /> {group.location}</div>
              <div className="flex items-center gap-2"><Users size={16} /> Up to {group.maxMembers} members</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseGroups;