/* istanbul ignore file */
const { createProxyMiddleware } = require("http-proxy-middleware");

const apiTarget = "http://localhost:8086";

module.exports = function (app) {
  app.use(
    "/ai/api",
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
    })
  );
};
