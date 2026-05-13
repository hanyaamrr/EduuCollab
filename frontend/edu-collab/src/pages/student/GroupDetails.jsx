import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, FileText, Send, Download, Trash2, Upload, ArrowLeft, Search, X } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';


const GroupDetails = () => {
    const { groupId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('discussion');
    const scrollRef = useRef();

    // --- State ---
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [materials, setMaterials] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [fileTag, setFileTag] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (activeTab === 'discussion') fetchMessages();
        else fetchMaterials();
    }, [activeTab, groupId]);

    // --- Discussion Logic ---
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/Discussion/group/${groupId}`);
            setMessages(res.data);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) { toast.error("Failed to load messages"); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post('/api/Discussion', { studyGroupId: parseInt(groupId), content: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) { toast.error("Failed to send message"); }
    };

    const handleSearchMaterials = async () => {
        try {
            if (!searchQuery.trim()) {
                // If the search bar is empty, just fetch all materials
                fetchMaterials();
                return;
            }
            const [nameRes, tagRes] = await Promise.all([
                api.get(`/api/Material/group/${groupId}/search-name?fileName=${encodeURIComponent(searchQuery)}&userId=${user.id}`),
                api.get(`/api/Material/group/${groupId}/search-tag?tag=${encodeURIComponent(searchQuery)}&userId=${user.id}`)
            ]);

            const combinedMaterials = [...nameRes.data, ...tagRes.data];

            const uniqueMaterialsMap = new Map(combinedMaterials.map(file => [file.id, file]));
            const uniqueMaterials = Array.from(uniqueMaterialsMap.values());

            setMaterials(uniqueMaterials);

        } catch (err) {
            console.error("Search error:", err);
            toast.error("Search failed");
        }
    };

    // --- Materials Logic ---
    const fetchMaterials = async () => {
        try {
            const res = await api.get(`/api/Material/group/${groupId}?userId=${user.id}`);
            setMaterials(res.data);
        } catch (err) { toast.error("Failed to load materials"); }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('File', uploadFile);
        formData.append('FileName', uploadFile.name);
        formData.append('StudyGroupId', groupId);
        formData.append('UserId', user.id);
        formData.append('Tag', fileTag);

        try {
            await api.post('/api/Material/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("File uploaded!");
            setUploadFile(null);
            setFileTag('');
            fetchMaterials();
        } catch (err) { toast.error(err.response?.data || "Upload failed"); }
    };

    const handleDownload = async (materialId, fileName) => {
        try {
            const response = await api.get(`/api/Material/download/${materialId}?userId=${user.id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (err) { toast.error("Download failed"); }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            {/* Tab Headers */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button onClick={() => setActiveTab('discussion')} className={`pb-4 px-2 font-bold flex items-center gap-2 transition-all ${activeTab === 'discussion' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>
                    <MessageSquare size={20} /> Discussion
                </button>
                <button onClick={() => setActiveTab('materials')} className={`pb-4 px-2 font-bold flex items-center gap-2 transition-all ${activeTab === 'materials' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>
                    <FileText size={20} /> Materials
                </button>
            </div>

            {/* Tab Content: Discussion */}
            {activeTab === 'discussion' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.messageId} className={`flex flex-col ${msg.senderId === parseInt(user.id) ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-slate-400 mb-1">{msg.senderName} • {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.senderId === parseInt(user.id) ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write a message..." className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20" />
                        <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* Tab Content: Materials */}
            {activeTab === 'materials' && (
                <div className="space-y-6">
                    {/* Upload Section (RESTORED!) */}
                    <form onSubmit={handleFileUpload} className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-bold text-blue-800 mb-2">Upload New Material</label>
                            <input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Tag (e.g. Lecture 1)"
                            value={fileTag}
                            onChange={(e) => setFileTag(e.target.value)}
                            className="bg-white border-none rounded-xl px-4 py-2 text-sm shadow-sm"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Upload size={18} /> Upload
                        </button>
                    </form>

                    {/* Search Bar Section */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search materials by name or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchMaterials()}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearchMaterials}
                            className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-sm"
                        >
                            Search
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchMaterials(); // Instantly reset the list
                                }}
                                className="bg-slate-100 text-slate-500 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Materials List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((file) => (
                            <div key={file.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{file.fileName}</h4>
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{file.tag || 'No Tag'}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDownload(file.id, file.fileName)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;