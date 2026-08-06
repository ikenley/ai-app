import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useApiClient } from "../hooks/ApiClientContext";
import useInterval from "../hooks/useInterval";
import redirectToLogin from "./redirectToLogin";
import User from "./User";

const REFRESH_TOKEN_TIMEOUT = 1740000; // 29 minutes

export type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: User | null;
};

export type AuthValue = AuthState & {
  login: () => void;
  logout: () => void;
};

const defaultAuthState: AuthValue = {
  isLoading: true,
  isAuthenticated: false,
  isAuthorized: false,
  user: null,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext(defaultAuthState);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

type Props = {
  children: React.ReactNode;
};

export const AuthContextProvider = ({ children }: Props) => {
  const apiClient = useApiClient();
  const [authState, setAuthState] = useState<AuthState>({
    ...defaultAuthState,
  });

  const handleLogin = useCallback(() => {
    // setLoginResponse(response);
  }, []);

  const handleLogout = useCallback(() => {
    //setLoginResponse(null);
  }, []);

  /** Get ID token or redirect to login page */
  const getIdToken = useCallback(() => {
    const invoke = async () => {
      const idToken = await apiClient.refreshAuthToken();
      if (idToken) {
        const user = User.fromIdToken(idToken);

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isAuthorized: true,
          user,
        });
      } else {
        redirectToLogin();
      }
    };

    invoke();
  }, [apiClient]);

  // On page load, fetch ID token
  // TODO consider calling evert X minutes via a timeout function
  useEffect(() => {
    getIdToken();
  }, [getIdToken]);

  /** Refresh token at regular interval */
  useInterval(getIdToken, REFRESH_TOKEN_TIMEOUT);

  const authValue = useMemo(() => {
    const value: AuthValue = {
      ...authState,
      login: handleLogin,
      logout: handleLogout,
    };
    return value;
  }, [authState, handleLogin, handleLogout]);

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
