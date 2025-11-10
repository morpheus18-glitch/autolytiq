import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  login: (token: string, user: User, tenant: Tenant) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');

    if (storedToken && storedUser && storedTenant) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setTenant(JSON.parse(storedTenant));
    }
  }, []);

  const login = (newToken: string, newUser: User, newTenant: Tenant) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('tenant', JSON.stringify(newTenant));

    setToken(newToken);
    setUser(newUser);
    setTenant(newTenant);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');

    setToken(null);
    setUser(null);
    setTenant(null);

    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
