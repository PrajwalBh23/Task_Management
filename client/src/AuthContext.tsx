import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import jwtDecode from 'jwt-decode'; // Correct import for jwt-decode
// import jwt_decode from 'jwt-decode';
// import jwtDecode from 'jwt-decode';
import { jwtVerify, decodeJwt } from 'jose';

interface AuthContextType {
  user: User | null;
  register: (token: string) => void;
  login: (token: string) => void;
  logout: () => void;
  loginOrNot: () => User | null;
}

interface User {
  token: string;
  [key: string]: any; // Include other decoded token properties
}

export const API = "http://localhost:5000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You should verify the token using the secret key (or public key if using asymmetric encryption)
          const secret = new TextEncoder().encode("THISISINTERNSHIPASSIGNMENTSOIHAVETOSUBMITITASSOONASPOSSIBLE");

          // Verify the token
          const { payload } = await jwtVerify(token, secret);

          setUser({ ...payload, token });
        } catch (error) {
          console.error("Invalid token", error);
          logout();
        }
      }
    };

    checkToken();
  }, []);

  const register = (token: string) => {
    localStorage.setItem('token', token);
    // const decodedToken = jwt(token);
    const decoded = decodeJwt(token);
    setUser({ ...decoded, token });
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded = decodeJwt(token);

    // Update the user state with the decoded token and the original token
    setUser({ ...decoded, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginOrNot = () => {
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loginOrNot }}>
      {children}
    </AuthContext.Provider>
  );
};