import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, Users, Shield, LayoutDashboard, GraduationCap } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const BottomDockNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-6 py-3 flex items-center gap-8 border border-slate-200 z-50">

        {/* =========================================
          PUBLIC VIEW (When no one is logged in)
          ========================================= */}
        {!user ? (
            <>
              <NavLink
                  to="/"
                  className={({ isActive }) =>
                      `flex flex-col items-center transition-all ${
                          isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                      }`
                  }
              >
                <Users size={24} />
                <span className="text-[10px] font-semibold mt-1">Groups</span>
              </NavLink>

              <NavLink
                  to="/login"
                  className={({ isActive }) =>
                      `flex flex-col items-center transition-all ${
                          isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                      }`
                  }
              >
                <LogIn size={24} />
                <span className="text-[10px] font-semibold mt-1">Login</span>
              </NavLink>
            </>
        ) : (
            /* =========================================
               AUTHENTICATED VIEW (When logged in)
               ========================================= */
            <>
              {/* 1. GROUPS LINK (Hidden for Admins) */}
              {user.role !== 'Admin' && (
                  <NavLink
                      to="/"
                      className={({ isActive }) =>
                          `flex flex-col items-center transition-all ${
                              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                          }`
                      }
                  >
                    <Users size={24} />
                    <span className="text-[10px] font-semibold mt-1">Groups</span>
                  </NavLink>
              )}

              {/* 2. DYNAMIC DASHBOARD LINK (Changes based on Role) */}
              {user.role === 'Admin' && (
                  <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                          `flex flex-col items-center transition-all ${
                              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                          }`
                      }
                  >
                    <Shield size={24} />
                    <span className="text-[10px] font-semibold mt-1">Manage</span>
                  </NavLink>
              )}

              {user.role === 'GroupCreator' && (
                  <NavLink
                      to="/creator"
                      className={({ isActive }) =>
                          `flex flex-col items-center transition-all ${
                              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                          }`
                      }
                  >
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-semibold mt-1">Dashboard</span>
                  </NavLink>
              )}

              {user.role === 'Student' && (
                  <NavLink
                      to="/student"
                      className={({ isActive }) =>
                          `flex flex-col items-center transition-all ${
                              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-blue-500 hover:scale-105'
                          }`
                      }
                  >
                    <GraduationCap size={24} />
                    <span className="text-[10px] font-semibold mt-1">My Hub</span>
                  </NavLink>
              )}

              {/* 3. LOGOUT BUTTON (Always visible for logged-in users) */}
              <button
                  onClick={handleLogout}
                  className="flex flex-col items-center transition-all text-slate-400 hover:text-red-500 hover:scale-105"
              >
                <LogOut size={24} />
                <span className="text-[10px] font-semibold mt-1">Logout</span>
              </button>
            </>
        )}
      </div>
  );
};

export default BottomDockNav;