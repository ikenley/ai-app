import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default defineConfig([
  {
    plugins: { js, react },
  },
]);
