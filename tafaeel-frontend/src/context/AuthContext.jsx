import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null); // Store user data here
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/auth/check-auth`,
                { 
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Auth response:', response.data);
            
            if (response.data.authenticated) {
                setIsAuthenticated(true);
                setUserRole(response.data.user.user_type);
                setUser(response.data.user); // Update user data
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
            setUserRole(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (user) => {
        setIsAuthenticated(true);
        setUserRole(user.user_type);
        setUser(user); // Update user data on login
        await checkAuthStatus(); // Refresh auth status after login
    };

    const logout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUserRole(null);
            setUser(null); // Clear user data on logout
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            loading, 
            login, 
            logout, 
            userRole,
            user 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
