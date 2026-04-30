const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const defaultDataFile = path.join(root, 'data', 'content.json');
const dataFile = path.resolve(process.env.DATA_FILE || defaultDataFile);
const port = Number(process.env.PORT || 5174);

const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'admin1234';
const tokens = new Set();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function readContent() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeContent(data) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function ensureDataFile() {
  if (fs.existsSync(dataFile)) return;
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.copyFileSync(defaultDataFile, dataFile);
}

function getToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function isAdmin(req) {
  return tokens.has(getToken(req));
}

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(root, requested.replace(/^\/+/, ''));
  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  fs.readFile(filePath, (error, data) => {
    if (error) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, data, mime[path.extname(filePath)] || 'application/octet-stream');
  });
}

async function route(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return send(res, 200, JSON.stringify({ ok: true, service: 'PICA HUB local server' }));
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    if (body.id !== adminUser || body.password !== adminPass) {
      return send(res, 401, JSON.stringify({ ok: false, message: '관리자 계정이 올바르지 않습니다.' }));
    }
    const token = crypto.randomBytes(24).toString('hex');
    tokens.add(token);
    return send(res, 200, JSON.stringify({ ok: true, token, user: { id: adminUser, role: 'admin', name: '관리자' } }));
  }

  if (url.pathname === '/api/content' && req.method === 'GET') {
    return send(res, 200, JSON.stringify(readContent()));
  }

  if (url.pathname === '/api/content' && req.method === 'PUT') {
    if (!isAdmin(req)) return send(res, 401, JSON.stringify({ ok: false, message: '관리자 로그인이 필요합니다.' }));
    const body = await readJson(req);
    writeContent(body);
    return send(res, 200, JSON.stringify({ ok: true, savedAt: new Date().toISOString(), content: body }));
  }

  return serveStatic(req, res);
}

http.createServer((req, res) => {
  route(req, res).catch(error => {
    console.error(error);
    send(res, 500, JSON.stringify({ ok: false, message: 'Server error' }));
  });
}).listen(port, () => {
  ensureDataFile();
  console.log(`PICA HUB server: http://localhost:${port}`);
  console.log(`Admin back office: http://localhost:${port}/admin.html`);
  console.log(`Data file: ${dataFile}`);
});
