import net from 'net';

const startPort = Number(process.argv[2]) || 3001;
const maxAttempts = 100;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort() {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await checkPort(port)) {
      process.stdout.write(String(port));
      process.exit(0);
    }
  }
  process.stderr.write('No available port found after ' + maxAttempts + ' attempts\n');
  process.exit(1);
}

findAvailablePort();
