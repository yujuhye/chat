const { createProxyMiddleware } = require("http-proxy-middleware");
const { SERVER_URL } = require("./util/url");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("*", {
      target: SERVER_URL.TARGET_URL(),
      changeOrigin: true,
    })
  );
  app.use(
    createProxyMiddleware("*", {
      target: "http://localhost:8080",
      changeOrigin: true,
    })
  )
};