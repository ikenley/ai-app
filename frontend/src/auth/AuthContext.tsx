import React, {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import axios from "axios";
import config from "../config";
import { useApiClient } from "../hooks/ApiClientContext";
import User from "./User";

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

/** Redirect to login page */
const redirectToLogin = () => {
  const returnUrl = encodeURI(global.location.toString());
  const loginUrl = `${config.authApiPrefix}/login?r=${returnUrl}`;
  global.location.href = loginUrl;
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

        // Add authorization header to all requests
        axios.defaults.headers.common["Authorization"] = `bearer ${idToken}`;

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
