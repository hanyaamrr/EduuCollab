import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <ShieldAlert className="text-red-600 w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-8 text-lg">
        You don't have the required permissions to view this page. If you believe this is an error, please contact support.
      </p>
      <button 
        onClick={() => navigate(-1)} // Goes back to the previous safe page
        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl transition-all shadow-md"
      >
        <ArrowLeft size={20} /> Go Back
      </button>
    </div>
  );
};

export default Unauthorized;