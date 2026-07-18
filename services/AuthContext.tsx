import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, TelegramUser } from './authService';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const AUTH_TIMEOUT = 6000; // 6 seconds fail-safe

    const initAuth = async () => {
      console.log("Initializing authentication flow...");
      
      // Fail-safe timeout to ensure app never gets stuck
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setState(prev => {
            if (prev.isLoading) {
              console.warn("Auth initialization timed out. Forcing loading to false.");
              return { ...prev, isLoading: false };
            }
            return prev;
          });
        }
      }, AUTH_TIMEOUT);

      try {
        // 1. Check for Telegram WebApp
        let isTelegram = authService.isTelegramMiniApp();
        
        // Short retry mechanism (max ~1 second)
        if (!isTelegram) {
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            isTelegram = authService.isTelegramMiniApp();
            if (isTelegram) {
              break;
            }
          }
        }

        if (isTelegram) {
          const webApp = (window as any).Telegram?.WebApp;
          if (webApp) {
            webApp.ready();
            webApp.expand?.();
          }

          const tgUser = authService.getTelegramUser();
          if (tgUser) {
            // INSTANT AUTH: Create profile and set state immediately
            const profile = authService.createLocalProfile(tgUser);
            setState({
              isAuthenticated: true,
              user: profile,
              isLoading: false,
              error: null,
            });

            // NON-BLOCKING SYNC: Run in background
            authService.syncUserToFirebase(profile, tgUser).catch(err => {
              console.error("Background Firebase sync failed:", err);
            });
            
            clearTimeout(timeoutId);
            return;
          } else {
            console.warn("Telegram detected but user data missing.");
            setState(prev => ({ ...prev, error: "Telegram data unavailable" }));
          }
        }

        // 2. Fallback to localStorage
        const storedUser = localStorage.getItem('betlify_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log("Session restored from localStorage:", user.id);
            setState({
              isAuthenticated: true,
              user: user,
              isLoading: false,
              error: null,
            });
            clearTimeout(timeoutId);
            return;
          } catch (e) {
            console.error("localStorage restore failure:", e);
          }
        }

        // 3. Default to unauthenticated
        console.log("No user found. Entering guest mode.");
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });

      } catch (error: any) {
        console.error("Critical error during auth initialization:", error);
        setState(prev => ({ ...prev, isLoading: false, error: error.message || "Auth failed" }));
      } finally {
        clearTimeout(timeoutId);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (user: UserProfile) => {
    setState({
      isAuthenticated: true,
      user: user,
      isLoading: false,
      error: null,
    });
  };

  const logout = async () => {
    await authService.logout();
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
