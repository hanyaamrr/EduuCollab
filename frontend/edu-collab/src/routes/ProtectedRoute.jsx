// import { Navigate, Outlet } from 'react-router-dom';
// import useAuth from '../hooks/useAuth';

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     // Redirect to a neutral ground or their specific dashboard if role fails
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import  BrowseGroup  from "../pages/public/BrowseGroups";
import  Login  from "../pages/public/Login";
import  Register  from "../pages/public/Signup";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreatorDashboard from "../pages/creator/CreatorDashboard";
import  StudentDashboard  from "../pages/student/StudentDashboard";
import { GuestGuard } from "../guards/GuestGuard";
import { AuthGuard } from "../guards/AuthGuard";
import GroupDetails from "../pages/student/GroupDetails";

export const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      { path: "", element: <BrowseGroup /> },

      {
        element: <GuestGuard />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },

      {
        element: <AuthGuard allowedRoles={["Admin"]} />,
        children: [
          { path: "admin", element: <AdminDashboard /> },
        ],
      },

      {
        element: <AuthGuard allowedRoles={["GroupCreator"]} />,
        children: [
          // Change <CreateDashboard /> to <CreatorDashboard />
          { path: "creator", element: <CreatorDashboard /> },
        ],
      },

      {
        element: <AuthGuard allowedRoles={["Student"]} />,
        children: [
          { path: "student", element: <StudentDashboard /> },
          { path: "group/:groupId", element: <GroupDetails /> },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);