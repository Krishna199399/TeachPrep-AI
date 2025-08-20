import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { NotificationType } from '@/components/Notification';

// Define authentication types
export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar?: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData extends Credentials {
  fullName: string;
  role: string;
  department: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  error: string | null;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  error: null,
});

// Provider component
export const AuthProvider: React.FC<{ 
  children: ReactNode;
  onAuthStateChanged?: (isAuthenticated: boolean) => void;
}> = ({ 
  children, 
  onAuthStateChanged 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for stored authentication on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('teachprep_user');
    const storedToken = localStorage.getItem('teachprep_token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Verify token with the server
        validateToken(storedToken);
      } catch (err) {
        console.error('Failed to parse stored user', err);
        localStorage.removeItem('teachprep_user');
        localStorage.removeItem('teachprep_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Notify parent component when auth state changes
  useEffect(() => {
    if (onAuthStateChanged) {
      onAuthStateChanged(!!user);
    }
  }, [user, onAuthStateChanged]);

  // Validate token with the server
  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token is invalid, log the user out
        logout();
      }
    } catch (err) {
      console.error('Token validation error:', err);
      // Error checking token, but don't log out (could be network issue)
    }
  };

  // Login function
  const login = async (credentials: Credentials): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Invalid email or password');
        setIsLoading(false);
        return false;
      }
      
      // Store user and token
      localStorage.setItem('teachprep_user', JSON.stringify(data.user));
      localStorage.setItem('teachprep_token', data.token);
      
      // Update state
      setUser(data.user);
      setToken(data.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Call the logout API (if needed)
    try {
      if (token) {
        // Async call but we don't need to wait for it
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear local storage and state
    localStorage.removeItem('teachprep_user');
    localStorage.removeItem('teachprep_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Call the register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        setError(responseData.message || 'Registration failed');
        setIsLoading(false);
        return false;
      }
      
      // For immediate login after registration
      localStorage.setItem('teachprep_user', JSON.stringify(responseData.user));
      localStorage.setItem('teachprep_token', responseData.token);
      
      // Update state
      setUser(responseData.user);
      setToken(responseData.token);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        logout,
        register,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext); 