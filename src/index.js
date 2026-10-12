import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '../..');
const bare = createBareServer('/bare/');
const app = express();

// Serve the primary Preston Proxy frontend files securely
app.use(express.static(join(__dirname, 'public')));

// Fallback configuration routing to prevent absolute path TypeErrors
app.use((req, res) => {
    res.status(404).sendFile(join(__dirname, 'public', 'index.html'));
});

const server = createHttpServer();

server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.route(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Preston Proxy running live on port ${PORT}`);
});
