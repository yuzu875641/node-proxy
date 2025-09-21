const { createProxyMiddleware } = require('http-proxy-middleware');

// プロキシのターゲットURLを取得するヘルパー関数
const getTargetUrl = (req) => {
    const url = new URL(`http://localhost${req.url}`);
    const targetUrl = url.searchParams.get('url');
    return targetUrl ? decodeURIComponent(targetUrl) : null;
};

// プロキシミドルウェアの設定
const proxyMiddleware = (req, res) => {
    const target = getTargetUrl(req);

    if (!target) {
        res.statusCode = 400;
        res.end('Missing target URL');
        return;
    }

    createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: false, // HTTPSサイトのプロキシを許可
        onProxyRes: (proxyRes, req, res) => {
            // レスポンスヘッダーからContent-Security-Policyを削除
            // これにより、ブロックされるコンテンツを許可します
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
        },
        logLevel: 'debug',
    })(req, res);
};

module.exports = proxyMiddleware;
