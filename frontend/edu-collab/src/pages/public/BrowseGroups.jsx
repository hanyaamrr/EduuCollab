import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // <-- Check this path matches your folder structure!

const BrowseGroups = () => {
    const [search, setSearch] = useState('');
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch all groups when the component loads
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('api/StudyGroup/all');
                setGroups(response.data);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
                setError("Could not load study groups. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    // Lightning-fast frontend search filtering
    const filteredGroups = groups.filter((group) => {
        const searchTerm = search.toLowerCase();
        return (
            (group.name && group.name.toLowerCase().includes(searchTerm)) ||
            (group.subject && group.subject.toLowerCase().includes(searchTerm)) ||
            (group.location && group.location.toLowerCase().includes(searchTerm))
        );
    });

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
                    className="w-full pl-12 pr-6 py-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-700 transition-all"
                    placeholder="Search by subject, name, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* State 1: Loading */}
            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* State 2: Error */}
            {!isLoading && error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50/50 rounded-[2rem] border border-red-100 text-center">
                    <AlertCircle className="text-red-500 mb-3" size={40} />
                    <h3 className="text-lg font-semibold text-red-800">{error}</h3>
                </div>
            )}

            {/* State 3: No Results Found */}
            {!isLoading && !error && filteredGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-[2rem] border border-slate-100 text-center">
                    <Search className="text-slate-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No study groups found</h3>
                    <p className="text-slate-500">
                        {search ? `We couldn't find anything matching "${search}".` : "There are no active study groups right now."}
                    </p>
                </div>
            )}

            {/* State 4: Grid Layout (Success) */}
            {!isLoading && !error && filteredGroups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
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

                            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                                {group.name}
                            </h3>

                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} /> {group.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} /> Up to {group.maxMembers} members
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseGroups;