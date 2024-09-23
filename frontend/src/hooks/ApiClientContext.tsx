import React, { createContext, useContext, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../config";
import {
  CreatePunParams,
  CreatePunResponse,
  RequestImageParams,
  CreateStoryParams,
  SendChatParams,
  SendChatResponse,
} from "../types";
import redirectToLogin from "../auth/redirectToLogin";

/** A context which provides an implementation for all REST API calls.
 * This makes testing easier, becaus we can provide mock implementations.
 */

/** Configure default axios behavior */
const _axios = axios.create();
_axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    const statusCode = err.response.status;
    // If error message is auth-related, redirect to login
    if (statusCode === 401) {
      redirectToLogin();
    }
    // Else just notify user
    else {
      toast.error("An error has occurred 🔥");
    }
    Promise.reject(err);
  }
);

export type ApiClientType = {
  refreshAuthToken: () => Promise<string | null>;
  createPun: (params: CreatePunParams) => Promise<CreatePunResponse>;
  createImage: (params: RequestImageParams) => Promise<any>;
  createStory: (params: CreateStoryParams) => Promise<any>;
  sendChatPrompt: (params: SendChatParams) => Promise<SendChatResponse>;
};

const defaultApiClient: ApiClientType = {
  refreshAuthToken: async () => {
    try {
      const response = await _axios.post(
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

      // Add authorization header to all requests
      _axios.defaults.headers["Authorization"] = `bearer ${idToken}`;
      _axios.defaults.headers.common["Authorization"] = `bearer ${idToken}`;

      return idToken;
    } catch {
      return null;
    }
  },

  createPun: async (params: CreatePunParams) => {
    const response = await _axios.post(`${config.apiPrefix}/ai/pun`, params);
    return response.data as CreatePunResponse;
  },

  createImage: async (params: RequestImageParams) => {
    const response = await _axios.post(`${config.apiPrefix}/image`, params);
    return response.data;
  },

  createStory: async (params: CreateStoryParams) => {
    const response = await _axios.post(`${config.apiPrefix}/storybook`, params);
    return response.data;
  },

  sendChatPrompt: async (params: SendChatParams) => {
    const response = await _axios.post(`${config.apiPrefix}/chat`, params);
    return response.data;
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
