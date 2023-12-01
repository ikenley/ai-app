import React, { useEffect } from "react";
import axios from "axios";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "./auth/AuthContext";
import { ApiClientContextProvider } from "./hooks/ApiClientContext";
import theme from "./theme";
import config from "./config";
import PrivateRoute from "./auth/PrivateRoute";
import MainPage from "./main/MainPage";
import ImagePage from "./image/ImagePage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
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
