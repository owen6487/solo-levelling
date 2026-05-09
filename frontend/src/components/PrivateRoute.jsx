import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';

// PrivateRoute wraps any route that requires the user to be logged in.
// If the user is NOT authenticated, it redirects them to /login.
// If the user IS authenticated, it renders the children (the protected page).
function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Not logged in → send to home page
        return <Navigate to="/" replace />;
    }

    // Logged in → show the page
    return children;
}

export default PrivateRoute;
