import React, { useEffect } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthContextProvider } from "./auth/AuthContext";
import { ApiClientContextProvider } from "./hooks/ApiClientContext";
import theme from "./theme";
import config from "./config";
import PrivateRoute from "./auth/PrivateRoute";
import MainPage from "./main/MainPage";

const queryClient = new QueryClient();

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
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            </AuthContextProvider>
          </ApiClientContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
