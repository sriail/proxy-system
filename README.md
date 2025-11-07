# Proxy System

A comprehensive, feature-rich proxy system built with multiple proxy backends including Ultraviolet, Scramjet, with support for Bare Server, Wisp, Epoxy Transport, and WireProxy for IP rotation.

## 🚀 Features

- **Multiple Proxy Backends**
  - 🔮 **Ultraviolet** - Stable and widely compatible web proxy
  - ⚡ **Scramjet** - Experimental proxy with advanced features
  
- **Transport Methods**
  - 🌐 **Bare Server** - Standard HTTP-based transport
  - 🔒 **Epoxy (Wisp)** - End-to-end encrypted WebSocket transport
  
- **User Interface**
  - 🔍 Search bar with DuckDuckGo integration
  - ⚙️ Settings page for customizing preferences
  - 📱 Responsive design for mobile and desktop
  - 🎨 Modern, dark-themed UI
  
- **Advanced Features**
  - 🔄 Multiple search engine support (DuckDuckGo, Google, Bing, Brave)
  - 🛡️ Privacy options (cookie clearing, ad blocking)
  - 📊 Real-time server status monitoring
  - 🌍 WireProxy support for IP rotation (see WIREPROXY.md)

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or pnpm package manager

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sriail/proxy-system.git
cd proxy-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. **Access the application:**
Open your browser and navigate to:
```
http://localhost:3000
```

## 🌐 Usage

### Search and Browse

1. Enter a URL or search query in the search bar
2. Press Enter or click the search button
3. The page will load through the selected proxy backend

### Quick Access Links

Use the quick access buttons to instantly visit popular sites:
- DuckDuckGo
- GitHub
- Reddit
- YouTube

### Settings

Navigate to the Settings page to customize:

**Proxy Backend:**
- **Ultraviolet** (Recommended) - Stable and compatible
- **Scramjet** - Experimental with advanced features

**Transport Method:**
- **Bare Server** - Standard HTTP transport
- **Epoxy (Wisp)** - Encrypted WebSocket transport

**Search Engine:**
- DuckDuckGo (Default)
- Google
- Bing
- Brave Search

**Privacy Options:**
- Clear cookies on exit
- Block ads and trackers

## 📁 Project Structure

```
proxy-system/
├── index.js                 # Main server file
├── package.json             # Dependencies and scripts
├── WIREPROXY.md            # WireProxy configuration guide
├── public/                  # Frontend files
│   ├── index.html          # Main HTML page
│   ├── css/
│   │   └── style.css       # Styling
│   ├── js/
│   │   └── app.js          # Client-side JavaScript
│   └── uv/
│       └── uv.config.js    # Ultraviolet configuration
└── node_modules/           # Dependencies
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production          # Environment mode
```

## 🛠️ Technical Details

### Backend Services

1. **Express Server** - HTTP server for serving static files and API endpoints
2. **Bare Server** - Handles HTTP proxy requests on `/bare/`
3. **Wisp Server** - WebSocket-based transport on `/wisp/`

### Frontend Libraries

- **Ultraviolet** - `/uv/` - Main proxy service for Ultraviolet
- **Scramjet** - `/scramjet/` - Alternative proxy service
- **Bare-Mux** - `/baremux/` - Transport multiplexer
- **Epoxy Transport** - `/epoxy/` - Encrypted transport layer

### API Endpoints

- `GET /health` - Server health check
- `GET /api/search?q=query` - Search endpoint

## 🔄 WireProxy Integration

For IP rotation and enhanced privacy, see [WIREPROXY.md](WIREPROXY.md) for detailed configuration instructions.

WireProxy allows you to:
- Route traffic through WireGuard VPN servers
- Rotate IP addresses to avoid rate limits
- Enhance privacy and security

## 🐳 Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t proxy-system .
docker run -p 3000:3000 proxy-system
```

## 🚀 Production Deployment

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /wisp/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### PM2 Process Manager

```bash
npm install -g pm2
pm2 start index.js --name proxy-system
pm2 save
pm2 startup
```

## 🔒 Security Considerations

1. **HTTPS** - Always use HTTPS in production
2. **Rate Limiting** - Implement rate limiting to prevent abuse
3. **Authentication** - Consider adding authentication for private deployments
4. **Content Filtering** - Implement content filtering as needed
5. **Logging** - Monitor and log access for security purposes

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 3000 is already in use
- Verify all dependencies are installed
- Check Node.js version (16+ required)

**Proxy not working:**
- Clear browser cache and cookies
- Check browser console for errors
- Verify server is running and accessible

**WebSocket errors:**
- Ensure WebSocket connections are allowed through firewall
- Check reverse proxy configuration for WebSocket support

### Debug Mode

Run with debug logging:
```bash
NODE_ENV=development npm start
```

## 📚 Resources

- [Ultraviolet Documentation](https://github.com/titaniumnetwork-dev/Ultraviolet)
- [Scramjet Documentation](https://github.com/MercuryWorkshop/scramjet)
- [Bare Server Documentation](https://github.com/tomphttp/bare-server-node)
- [Wisp Protocol](https://github.com/MercuryWorkshop/wisp-protocol)
- [WireProxy Guide](WIREPROXY.md)

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Note:** This proxy system is designed for educational purposes and legitimate use cases. Always respect website terms of service and local laws.
