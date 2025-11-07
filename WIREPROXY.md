# WireProxy Configuration Guide

WireProxy is a userspace WireGuard client that can be used to route traffic through different IP addresses, helping to rotate where web traffic appears to come from. This is useful for avoiding rate limits and IP-based blocks.

## What is WireProxy?

WireProxy is a standalone application that allows you to connect to WireGuard VPN servers without requiring kernel WireGuard support. It creates a SOCKS5 proxy that routes traffic through the WireGuard tunnel.

## Installation

### On Linux/macOS:

```bash
# Download the latest release
wget https://github.com/octeep/wireproxy/releases/latest/download/wireproxy-linux-amd64

# Make it executable
chmod +x wireproxy-linux-amd64
sudo mv wireproxy-linux-amd64 /usr/local/bin/wireproxy
```

### On Windows:

Download the Windows executable from: https://github.com/octeep/wireproxy/releases

## Configuration

Create a configuration file `wireproxy.conf`:

```ini
[Interface]
# Your WireGuard private key
PrivateKey = YOUR_PRIVATE_KEY_HERE

# Your IP address in the VPN
Address = 10.0.0.2/32

# DNS servers to use
DNS = 1.1.1.1, 8.8.8.8

[Peer]
# WireGuard server public key
PublicKey = SERVER_PUBLIC_KEY_HERE

# Endpoint of the WireGuard server
Endpoint = vpn.example.com:51820

# AllowedIPs - routes all traffic through VPN
AllowedIPs = 0.0.0.0/0

# Keep connection alive
PersistentKeepalive = 25

[Socks5]
# SOCKS5 proxy that WireProxy will create
BindAddress = 127.0.0.1:1080
```

## Using with the Proxy System

### Option 1: System-wide SOCKS proxy

1. Start WireProxy:
```bash
wireproxy -c wireproxy.conf
```

2. Configure your system or the Node.js server to use the SOCKS5 proxy at `127.0.0.1:1080`

### Option 2: Environment Variables

Set these before starting the proxy server:

```bash
export HTTP_PROXY=socks5://127.0.0.1:1080
export HTTPS_PROXY=socks5://127.0.0.1:1080
npm start
```

### Option 3: Docker Compose (Recommended for Production)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wireproxy:
    image: ghcr.io/octeep/wireproxy:latest
    container_name: wireproxy
    volumes:
      - ./wireproxy.conf:/etc/wireproxy/wireproxy.conf
    command: -c /etc/wireproxy/wireproxy.conf
    restart: unless-stopped
    networks:
      - proxy-network

  proxy-system:
    build: .
    container_name: proxy-system
    ports:
      - "3000:3000"
    environment:
      - HTTP_PROXY=socks5://wireproxy:1080
      - HTTPS_PROXY=socks5://wireproxy:1080
    depends_on:
      - wireproxy
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge
```

## Multiple WireGuard Servers for IP Rotation

For automatic IP rotation, you can:

1. **Set up multiple WireProxy instances** on different ports with different WireGuard configurations
2. **Use a load balancer** to distribute traffic across multiple WireProxy instances
3. **Implement rotation logic** in your application to switch between proxies

Example with multiple configs:

```bash
# Start multiple WireProxy instances
wireproxy -c wireproxy-server1.conf &  # Port 1080
wireproxy -c wireproxy-server2.conf &  # Port 1081
wireproxy -c wireproxy-server3.conf &  # Port 1082
```

## Getting WireGuard VPN Credentials

You can get WireGuard VPN access from:

- **Mullvad VPN** (https://mullvad.net) - Privacy-focused VPN with WireGuard support
- **ProtonVPN** (https://protonvpn.com) - Secure VPN with WireGuard support
- **IVPN** (https://www.ivpn.net) - Privacy-focused VPN
- **Self-hosted** - Set up your own WireGuard server on a VPS

## Security Considerations

1. **Never commit your WireGuard private keys** to version control
2. Store configuration files securely with appropriate permissions (`chmod 600 wireproxy.conf`)
3. Use strong, randomly generated private keys
4. Rotate VPN servers regularly for better privacy
5. Monitor for IP leaks using services like https://ipleak.net

## Troubleshooting

### Connection Issues
```bash
# Test WireProxy is running
curl --socks5 127.0.0.1:1080 https://api.ipify.org
```

### Check logs
```bash
wireproxy -c wireproxy.conf --log-level debug
```

### Verify your IP is changing
```bash
# Without proxy
curl https://api.ipify.org

# With proxy
curl --socks5 127.0.0.1:1080 https://api.ipify.org
```

## Integration with Bare Server

To route Bare server traffic through WireProxy, modify the `index.js`:

```javascript
import { SocksProxyAgent } from 'socks-proxy-agent';

// Configure Bare server to use SOCKS proxy
const bareServer = createBareServer('/bare/', {
  maintainer: {
    email: 'admin@example.com'
  },
  // Use SOCKS proxy for upstream requests
  agent: new SocksProxyAgent('socks5://127.0.0.1:1080')
});
```

## Resources

- WireProxy GitHub: https://github.com/octeep/wireproxy
- WireGuard Official Site: https://www.wireguard.com/
- WireGuard Configuration Guide: https://www.wireguard.com/quickstart/

## Note

WireProxy is an external component and runs separately from this proxy system. It provides IP rotation capabilities by routing traffic through different WireGuard VPN servers. Start WireProxy before starting the proxy system for best results.
