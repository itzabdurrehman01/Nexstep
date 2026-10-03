import http from 'http';

const port = Number(process.argv[2]) || 3001;
const path = process.argv[3] || '/api/health';
const timeoutSec = Number(process.argv[4]) || 30;

const options = {
  host: 'localhost',
  port: port,
  path: path,
  method: 'GET',
  timeout: 2000,
};

function checkOnce() {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForHealth() {
  const start = Date.now();
  const timeoutMs = timeoutSec * 1000;
  let attempts = 0;

  while (Date.now() - start < timeoutMs) {
    attempts++;
    const ok = await checkOnce();
    if (ok) {
      process.stderr.write('[OK] Health check passed on attempt ' + attempts + ' (http://localhost:' + port + path + ')\n');
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  process.stderr.write('[ERROR] Health check timed out after ' + timeoutSec + 's (' + attempts + ' attempts)\n');
  process.exit(1);
}

waitForHealth();
