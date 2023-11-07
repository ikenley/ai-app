/* istanbul ignore file */
const { createProxyMiddleware } = require("http-proxy-middleware");

const apiTarget = "http://localhost:8086";
const authApiTarget = "http://localhost:8088";

module.exports = function (app) {
  app.use(
    "/ai/api",
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
    })
  );

  app.use(
    "/auth/api",
    createProxyMiddleware({
      target: authApiTarget,
      changeOrigin: true,
    })
  );
};
