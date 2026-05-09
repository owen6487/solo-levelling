import React from 'react'
import { createContext, useState } from 'react';
import api from '../Hooks/api';

const getInitialUser = () => {
    // Token is stored in httpOnly cookie, not accessible from frontend
    // Return null initially; user will be fetched on mount via refreshUserProfile
    return null;
}
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser());

    const refreshUserProfile = async () => {
        try {
            const response = await api.get('/api/users/profile');
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to refresh user profile:', error);
            if (error.response && error.response.status === 401) {
                // Don't logout immediately - user might not be logged in yet
                setUser(null);
            }
        }
    };

    const login = async (email, password) => {
        try {
            await api.post('/api/users/login', { email, password });
            // Token is now stored in httpOnly cookie by backend
            // Fetch the user profile (cookies sent automatically)
            await refreshUserProfile();
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };
    const register = async ({name, email, password}) => {
        try {
            const response = await api.post('/api/users/register', { name, email, password });
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call backend logout endpoint to clear httpOnly cookie
            await api.post('/api/users/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        setUser(null);
    };

    React.useEffect(() => {
        // Try to restore user session on mount via cookies
        // This will fail silently if not logged in (which is expected)
        const initializeAuth = async () => {
            try {
                await refreshUserProfile();
            } catch (error) {
                // Silently fail - user is not authenticated yet
            }
        };
        initializeAuth();
    }, []);

    // isAuthenticated is true when user is not null (i.e. a valid token exists)
    const isAuthenticated = user !== null;

    return (
        // Expose isAuthenticated so any component can check login state
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext
