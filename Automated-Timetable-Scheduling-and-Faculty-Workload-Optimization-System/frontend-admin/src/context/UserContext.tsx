import React, { createContext, useContext, useState, useEffect } from 'react';
/**
 * UserContext.tsx
 * Manages the high-level faculty user profile state.
 * It stays in sync with the AuthContext to provide reactive updates
 * to components like the Sidebar and Dashboard when a user logs in.
 */
import { useAuth } from '../contexts/AuthContext';

interface Faculty {
    id: number;
    name: string;
    department: string;
    designation: string;
}

interface UserContextType {
    user: Faculty | null;
    loading: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser, role: authRole, logout: authLogout } = useAuth();
    const [user, setUser] = useState<Faculty | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authRole === 'faculty' && authUser) {
            setUser(authUser as unknown as Faculty);
        } else {
            setUser(null);
        }
        setLoading(false);
    }, [authUser, authRole]);

    const logout = () => {
        authLogout();
        window.location.href = '/login';
    };

    return (
        <UserContext.Provider value={{ user, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
