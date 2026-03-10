import React, { createContext, useContext, useState, useEffect } from "react";
import { UserData } from "@/lib/api";

interface AuthContextType {
    user: UserData | null;
    role: "admin" | "faculty" | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: UserData, role: "admin" | "faculty") => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [role, setRole] = useState<"admin" | "faculty" | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("role");

        if (storedUser && storedRole) {
            setUser(JSON.parse(storedUser));
            setRole(storedRole as "admin" | "faculty");
        }
        setIsLoading(false);
    }, []);

    const login = (userData: UserData, userRole: "admin" | "faculty") => {
        setUser(userData);
        setRole(userRole);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", userRole);
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem("user");
        localStorage.removeItem("role");
    };

    const isAuthenticated = user !== null && role !== null;

    return (
        <AuthContext.Provider value={{ user, role, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
