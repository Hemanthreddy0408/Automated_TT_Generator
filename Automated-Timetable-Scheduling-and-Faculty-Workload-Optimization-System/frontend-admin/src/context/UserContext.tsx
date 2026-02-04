import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    const [user, setUser] = useState<Faculty | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Fetching the first faculty as the "logged in" user for now
                const response = await axios.get('http://localhost:8082/api/faculty/1', { timeout: 3000 });
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = () => {
        // Basic logout logic: clear user and redirect
        setUser(null);
        window.location.href = '/';
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
