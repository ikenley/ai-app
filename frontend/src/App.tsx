import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import ChatPage from "./chat/ChatPage";
import config from "./config";
import { ApiClientContextProvider } from "./hooks/ApiClientContext";
import ImagePage from "./image/ImagePage";
import MainPage from "./main/MainPage";
import StorybookPage from "./storybook/StorybookPage";
import theme from "./theme";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/ai/chat",
    element: (
      <PrivateRoute>
        <ChatPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/ai/image",
    element: (
      <PrivateRoute>
        <ImagePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/ai/pun",
    element: (
      <PrivateRoute>
        <MainPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/ai/storybook",
    element: (
      <PrivateRoute>
        <StorybookPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/ai",
    element: (
      <PrivateRoute>
        <MainPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainPage />
      </PrivateRoute>
    ),
  },
]);

const App = () => {
  // Log API info
  useEffect(() => {
    const getApiInfo = async () => {
      const res = await axios.get(`${config.apiPrefix}/status/info`);
      console.log("res", res);
    };
    getApiInfo();

    console.log(`VERSION`, config.version);
  }, []);

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ApiClientContextProvider>
            <AuthContextProvider>
              <CssBaseline />
              <RouterProvider router={router} />
              <ToastContainer />
            </AuthContextProvider>
          </ApiClientContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
