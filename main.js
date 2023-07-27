const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const hasLuckyConfigs = process.env.LUCKY_EXT_API_URL && process.env.LUCKY_PROXY_PATH && process.env.LUCKY_API_KEY;
if (!hasLuckyConfigs) {
    console.log(`WARNING: missing Lucky configs`);
}

const filter = function (pathname, req) {
    // return pathname.match('^/api') && req.method === 'GET';
    return hasLuckyConfigs && ['GET', 'POST'].includes(req.method);
};
app.use(process.env.LUCKY_PROXY_PATH, createProxyMiddleware(filter, {
    target: process.env.LUCKY_EXT_API_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Log the path
        console.log(req.params['path']);
        console.log(process.env.LUCKY_EXT_API_URL);
        proxyReq.setHeader("x-forwarded-for", req.connection.remoteAddress)
        proxyReq.setHeader("Authorization", `Key ${process.env.LUCKY_API_KEY}`)
        // Log the headers
        console.log(proxyReq.getHeaders());
    },
}));

app.listen(process.env.PORT, function() {
    console.log(`Server started on port ${process.env.PORT}`);
});