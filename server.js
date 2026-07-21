// pdev — tiny zero-dependency static server for the PropDev Deal Screener.
// Serves /public, with a /healthz check for Coolify. No database, no login.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff', '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  if (url === '/' || url === '') url = '/index.html';
  const rel = path.normalize(url).replace(/^([/\\])+/, '');
  let file = path.join(DIR, rel);
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  // extensionless routing: /pro -> /pro.html
  if (!path.extname(file) && !fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('pdev static server listening on ' + PORT));
