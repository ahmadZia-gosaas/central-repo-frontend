import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { apiLocalService } from '../services/APIRequest';

export interface User extends Record<string, unknown> {
  sub?: string; // Subject (user ID)
  email?: string;
  name?: string;
  role?: string; // User role
  id?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  [key: string]: unknown; // Allow any additional claims from the token
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  decodedToken: Record<string, unknown> | null;
  mac: string | null;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setMac: (mac: string) => void;
}

const setCookie = (name: string, value: string, days: number = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => {
  const initializeFromStorage = () => {
    // Try to get token from localStorage first, then from cookies
    let storedToken = localStorage.getItem('token');
    if (!storedToken) {
      storedToken = getCookie('token');
    }

    const storedUser = localStorage.getItem('user');
    const storedMac = localStorage.getItem('mac');

    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken,
      isAuthenticated: !!storedToken,
      decodedToken: storedToken ? jwtDecode<Record<string, unknown>>(storedToken) : null,
      mac: storedMac,
    };
  };

  return {
    ...initializeFromStorage(),

    login: (token: string) => {
      try {
        const decodedToken = jwtDecode<User>(token);

        // Store the decoded token claims as the user object
        localStorage.setItem('user', JSON.stringify(decodedToken));
        localStorage.setItem('token', token);

        // Also store token in cookie (7 days expiry)
        setCookie('token', token, 7);

        set({
          user: decodedToken,
          token,
          isAuthenticated: true,
          decodedToken,
        });

        // Automatically fetch MAC address after login
        const fetchMac = async () => {
          try {
            const response = await apiLocalService.get('/client/mac');
            if (response.data.mac) {
              localStorage.setItem('mac', response.data.mac);
              set({ mac: response.data.mac });
            }
          } catch (error) {
            console.error('Error auto-fetching MAC address:', error);
          }
        };
        fetchMac();
      } catch (error) {
        console.error('Invalid token:', error);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          decodedToken: null,
        });
      }
    },

    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      removeCookie('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        decodedToken: null,
      });
    },

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },

    setMac: (mac: string) => {
      localStorage.setItem('mac', mac);
      set({ mac });
    },
  };
});
