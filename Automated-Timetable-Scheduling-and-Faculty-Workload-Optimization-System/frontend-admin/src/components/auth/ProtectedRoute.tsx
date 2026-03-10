import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "admin" | "faculty";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole
}) => {
    const { isAuthenticated, role, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null; // Don't redirect while still loading from localStorage
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        // Save the attempted URL to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required and user doesn't have it, redirect to appropriate page
    if (requiredRole && role !== requiredRole) {
        if (role === "admin") {
            return <Navigate to="/" replace />;
        } else if (role === "faculty") {
            return <Navigate to="/faculty/dashboard" replace />;
        }
    }

    // User is authenticated and has correct role
    return <>{children}</>;
};
