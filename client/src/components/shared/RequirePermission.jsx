import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';

/**
 * A wrapper component that conditionally renders its children
 * if the current user has the required permission.
 * 
 * Used for both protecting entire Routes (redirecting if unauthorized)
 * and hiding specific UI elements like buttons or links.
 */
const RequirePermission = ({ permission, children, fallback = null, isRoute = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return isRoute ? <div>Loading...</div> : null;
    }

    if (!user) {
        return isRoute ? <Navigate to="/login" replace /> : null;
    }

    // SUPER_ADMIN implicitly can do anything (or handled via hasPermission if mapped)
    // but we can also just rely on hasPermission which checks the exact mapping.
    const allowed = hasPermission(user.role, permission);

    if (!allowed) {
        if (isRoute) {
            return fallback ? fallback : <Navigate to="/unauthorized" replace />;
        }
        return fallback;
    }

    return <>{children}</>;
};

export default RequirePermission;
