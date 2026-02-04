import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id?: number;
    name: string;
    email?: string;
    designation: string;
    role?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>({
        // Mock user for now since we lost the context
        name: "Faculty Member",
        
        designation: "Assistant Professor",
        role: "FACULTY",
        id: 1
    });
    const [isLoading, setIsLoading] = useState(false);

    const logout = () => {
        setUser(null);
        // Add any cleanup logic here
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
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
