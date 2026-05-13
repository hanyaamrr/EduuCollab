import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export const AuthGuard = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
        let redirectPath = "/";
        if (user.role === "Admin") redirectPath = "/admin";
        if (user.role === "GroupCreator") redirectPath = "/creator";
        if (user.role === "Student") redirectPath = "/student";

        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
}