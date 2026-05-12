import { NavLink } from 'react-router-dom';
import { Home, Search, Users, Settings, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const BottomDockNav = () => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    if (!user) return [{ to: '/', icon: Home, label: 'Home' }, { to: '/login', icon: Users, label: 'Login' }];
    
    switch (user.role) {
      case 'Admin':
        return [
          { to: '/admin', icon: Settings, label: 'Manage' },
          { to: '/admin/groups', icon: Users, label: 'Groups' },
        ];
      case 'GroupCreator':
        return [
          { to: '/creator', icon: Home, label: 'My Groups' },
          { to: '/creator/requests', icon: Users, label: 'Requests' },
        ];
      case 'Student':
      default:
        return [
          { to: '/', icon: Search, label: 'Browse' },
          { to: '/student', icon: Home, label: 'Joined' },
        ];
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-2 px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl">
        {getNavLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ease-out ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md scale-105 -translate-y-1' 
                  : 'text-gray-500 hover:bg-white/80 hover:text-blue-600 hover:-translate-y-2 hover:shadow-md'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium mt-1 opacity-0 h-0 transition-all duration-300 group-hover:opacity-100 group-hover:h-auto">
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        
        {user && (
          <button
            onClick={logout}
            className="group flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-red-400 transition-all duration-300 ease-out ml-2 hover:bg-red-50 hover:text-red-600 hover:-translate-y-2 hover:shadow-md"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-medium mt-1 opacity-0 h-0 transition-all duration-300 group-hover:opacity-100 group-hover:h-auto">
              Logout
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default BottomDockNav;