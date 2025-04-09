export const config = {
  apiPrefix: import.meta.env.VITE_API_URL_PREFIX,
  authApiPrefix: import.meta.env.VITE_AUTH_API_URL_PREFIX,
  homepage: import.meta.env.VITE_HOMEPAGE || "/ai",
  version: import.meta.env.VITE_VERSION,
};

export default config;
