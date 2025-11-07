import express from 'express';
import { createServer } from 'http';
import { createBareServer } from '@tomphttp/bare-server-node';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer();

// CORS configuration
app.use(cors());

// Bare server setup
const bareServer = createBareServer('/bare/');

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Serve Ultraviolet files
app.use('/uv/', express.static(join(__dirname, 'node_modules/@titaniumnetwork-dev/ultraviolet/dist')));

// Serve Scramjet files
app.use('/scramjet/', express.static(join(__dirname, 'node_modules/@mercuryworkshop/scramjet/dist')));

// Serve bare-mux files
app.use('/baremux/', express.static(join(__dirname, 'node_modules/@mercuryworkshop/bare-mux/dist')));

// Serve epoxy-transport files
app.use('/epoxy/', express.static(join(__dirname, 'node_modules/@mercuryworkshop/epoxy-transport/dist')));

// API routes for search
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  // Redirect to DuckDuckGo search through the proxy
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  res.json({ url: searchUrl });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    services: {
      bare: 'running',
      wisp: 'running',
      ultraviolet: 'available',
      scramjet: 'available',
      epoxy: 'available'
    }
  });
});

// Handle bare server requests
server.on('request', (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else if (req.url.endsWith('/wisp/')) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 3000;

server.on('listening', () => {
  console.log(`🚀 Proxy Server running on port ${PORT}`);
  console.log(`📡 Bare Server: http://localhost:${PORT}/bare/`);
  console.log(`🌐 Wisp Server: ws://localhost:${PORT}/wisp/`);
  console.log(`🔮 Ultraviolet: Available`);
  console.log(`⚡ Scramjet: Available`);
  console.log(`🔒 Epoxy Transport: Available`);
  console.log(`\n💡 For WireProxy configuration, see WIREPROXY.md`);
});

server.listen(PORT);
