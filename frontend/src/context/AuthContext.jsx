import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Decode token safely assuming it contains user data, or just save user at login
            // A realistic implementation might fetch /api/auth/:id but we'll use local state for now
            // We'll rely on the user having been saved in local state during login
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch { }
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
        setIsChecking(false);
    }, [token]);

    const login = (userData, jwtToken) => {
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isChecking }}>
            {children}
        </AuthContext.Provider>
    );
};
