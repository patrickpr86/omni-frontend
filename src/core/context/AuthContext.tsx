import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type UserProfile = {
  id?: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  profilePhotoBase64?: string;
  profilePhotoMimeType?: string;
  profilePhotoFileName?: string;
  bio?: string;
  timezone?: string;
  roles: string[];
};

type AuthState = {
  token: string | null;
  user: UserProfile | null;
};

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
};

const STORAGE_KEY = "omni-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { token: null, user: null };
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { token: null, user: null };
    }

    try {
      const parsed: AuthState = JSON.parse(stored);
      return parsed;
    } catch {
      return { token: null, user: null };
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const login = useCallback((token: string, user: UserProfile) => {
    setState({ token, user });
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, user: null });
  }, []);

  const updateUser = useCallback((user: UserProfile) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      user: state.user,
      isAuthenticated: Boolean(state.token && state.user),
      login,
      logout,
      updateUser,
    }),
    [login, logout, updateUser, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
