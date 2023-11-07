import React, { createContext, useContext, useMemo } from "react";
import axios from "axios";
import config from "../config";

/** A context which provides an implementation for all REST API calls.
 * This makes testing easier, becaus we can provide mock implementations.
 */

export type ApiClientType = {
  refreshAuthToken: () => Promise<string | null>;
};

const defaultApiClient: ApiClientType = {
  refreshAuthToken: async () => {
    try {
      const response = await axios.post(
        `${config.authApiPrefix}/refresh`,
        {},
        // Remove authorization header from refresh token request
        {
          withCredentials: true,
          transformRequest: (data: any, headers: any) => {
            delete headers["Authorization"];
            return data;
          },
        }
      );
      const idToken = response.data as string;
      return idToken;
    } catch {
      return null;
    }
  },
};

export const ApiClientContext = createContext(defaultApiClient);

export const useApiClient = () => {
  return useContext(ApiClientContext);
};

type Props = {
  children: React.ReactNode;
};
export const ApiClientContextProvider = ({ children }: Props) => {
  const value = useMemo(() => {
    return defaultApiClient;
  }, []);

  return (
    <ApiClientContext.Provider value={value}>
      {children}
    </ApiClientContext.Provider>
  );
};