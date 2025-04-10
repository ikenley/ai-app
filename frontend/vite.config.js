import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

export default defineConfig(() => {
  return {
    server: {
      open: true,
      proxy: {
        "/ai/api": {
          target: "http://localhost:8086",
          changeOrigin: true,
        },
        "/auth/api": {
          target: "http://localhost:8088",
          changeOrigin: true,
        },
      },
    },
    // https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
    define: {
      "process.env": {},
    },
    build: {
      outDir: "build",
    },
    plugins: [react(), eslint()],
    test: {
      globals: true,
      environment: "jsdom",
      parallel: true,
      setupFiles: "./tests/setup.js",
    },
  };
});
