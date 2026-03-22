import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    fallbackPath?: string;
}

/**
 * RoleProtectedRoute - A wrapper component that checks if the user has the required role
 * to access a specific route. If the user doesn't have the required role, they are
 * redirected to the fallback path or their role-specific dashboard.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
    children,
    allowedRoles,
    fallbackPath
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user role is not in allowed roles, redirect to their dashboard
    if (user && !allowedRoles.includes(user.role)) {
        // Determine the fallback path based on user role
        const defaultFallback = user.role === 'entrepreneur'
            ? '/dashboard/entrepreneur'
            : '/dashboard/investor';

        return <Navigate to={fallbackPath || defaultFallback} replace />;
    }

    // Render the protected content
    return <>{children}</>;
};

export default RoleProtectedRoute;
