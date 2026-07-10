import express from 'express';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const server = express();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  // Middleware
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // API Routes
  server.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  server.get('/api/version', (req, res) => {
    res.json({ version: '31.0.0' });
  });

  // Next.js handler for all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
