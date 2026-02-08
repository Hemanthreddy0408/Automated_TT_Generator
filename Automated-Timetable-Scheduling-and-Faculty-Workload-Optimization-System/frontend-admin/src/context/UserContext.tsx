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
                // Try fetching specific ID 1
                const response = await axios.get('http://localhost:8083/api/faculty/1', { timeout: 3000 });
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.warn("Faculty 1 not found, trying to fetch first available faculty...");
                try {
                    const allResponse = await axios.get('http://localhost:8083/api/faculty', { timeout: 3000 });
                    if (allResponse.data && allResponse.data.length > 0) {
                        setUser(allResponse.data[0]);
                    } else {
                        console.error("No faculty members found in database");
                    }
                } catch (allError) {
                    console.error("Failed to fetch any faculty", allError);
                }
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
