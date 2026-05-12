import { Outlet } from 'react-router-dom';
import BottomDockNav from './BottomDockNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      {/* Generous bottom padding (pb-32) ensures the floating dock 
        doesn't overlap the page content at the very bottom.
      */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        <Outlet />
      </main>
      
      <BottomDockNav />
    </div>
  );
};

export default MainLayout;