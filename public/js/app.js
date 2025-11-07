// Proxy System Application
class ProxyApp {
    constructor() {
        this.settings = this.loadSettings();
        this.proxyFrame = document.getElementById('proxy-frame');
        this.init();
    }

    init() {
        this.initNavigation();
        this.initSearch();
        this.initSettings();
        this.initProxyBackend();
        this.checkServerStatus();
    }

    // Navigation between pages
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const pageName = btn.dataset.page;
                
                // Update active states
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                pages.forEach(p => p.classList.remove('active'));
                document.getElementById(`${pageName}-page`).classList.add('active');
            });
        });
    }

    // Search functionality
    initSearch() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const quickLinks = document.querySelectorAll('.quick-link');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                this.handleSearch(query);
            }
        });

        // Quick links
        quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.dataset.url;
                this.openProxiedUrl(url);
            });
        });
    }

    // Settings management
    initSettings() {
        const saveBtn = document.getElementById('save-settings');
        const saveMessage = document.getElementById('save-message');

        saveBtn.addEventListener('click', () => {
            this.saveSettings();
            saveMessage.textContent = '✓ Settings saved successfully!';
            saveMessage.className = 'save-message success show';
            
            setTimeout(() => {
                saveMessage.classList.remove('show');
            }, 3000);
        });

        // Load saved settings
        this.applySavedSettings();
    }

    // Initialize proxy backend
    async initProxyBackend() {
        try {
            const backend = this.settings.proxyBackend || 'ultraviolet';
            const transport = this.settings.transport || 'bare';

            if (backend === 'ultraviolet') {
                await this.initUltraviolet(transport);
            } else if (backend === 'scramjet') {
                await this.initScramjet(transport);
            }

            console.log(`✓ Proxy backend initialized: ${backend} with ${transport} transport`);
        } catch (error) {
            console.error('Error initializing proxy backend:', error);
        }
    }

    // Initialize Ultraviolet proxy
    async initUltraviolet(transport) {
        // Set up Ultraviolet configuration
        if (typeof __uv$config !== 'undefined') {
            __uv$config.bare = '/bare/';
            __uv$config.prefix = '/uv/service/';
        }

        // Configure transport
        if (transport === 'epoxy' && typeof BareMux !== 'undefined') {
            try {
                const BareMuxInstance = new BareMux.BareMuxConnection('/baremux/worker.js');
                await BareMuxInstance.setTransport('/epoxy/index.js', [{ wisp: 'ws://' + window.location.host + '/wisp/' }]);
                console.log('✓ Epoxy transport configured');
            } catch (error) {
                console.warn('Epoxy transport setup failed, falling back to Bare:', error);
            }
        }
    }

    // Initialize Scramjet proxy
    async initScramjet(transport) {
        // Scramjet configuration is handled by the scramjet bundle
        // The codecs are available as __scramjet$codecs global
        
        if (transport === 'epoxy' && typeof BareMux !== 'undefined') {
            try {
                const BareMuxInstance = new BareMux.BareMuxConnection('/baremux/worker.js');
                await BareMuxInstance.setTransport('/epoxy/index.js', [{ wisp: 'ws://' + window.location.host + '/wisp/' }]);
                console.log('✓ Scramjet with Epoxy transport configured');
            } catch (error) {
                console.warn('Epoxy transport setup failed:', error);
            }
        }
        
        console.log('✓ Scramjet initialized');
    }

    // Handle search queries
    handleSearch(query) {
        // Check if it's a URL or search query
        const urlPattern = /^https?:\/\//i;
        const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;

        let url;
        if (urlPattern.test(query)) {
            url = query;
        } else if (domainPattern.test(query)) {
            url = 'https://' + query;
        } else {
            // It's a search query
            const searchEngine = this.settings.searchEngine || 'duckduckgo';
            url = this.getSearchUrl(searchEngine, query);
        }

        this.openProxiedUrl(url);
    }

    // Get search URL based on engine
    getSearchUrl(engine, query) {
        const encodedQuery = encodeURIComponent(query);
        const searchEngines = {
            duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
            google: `https://www.google.com/search?q=${encodedQuery}`,
            bing: `https://www.bing.com/search?q=${encodedQuery}`,
            brave: `https://search.brave.com/search?q=${encodedQuery}`
        };
        return searchEngines[engine] || searchEngines.duckduckgo;
    }

    // Open URL through proxy
    openProxiedUrl(url) {
        const backend = this.settings.proxyBackend || 'ultraviolet';
        
        try {
            let proxiedUrl;
            
            if (backend === 'ultraviolet' && typeof __uv$config !== 'undefined') {
                // Ultraviolet handles encoding internally
                proxiedUrl = __uv$config.prefix + __uv$config.encodeUrl(url);
            } else if (backend === 'scramjet') {
                // Scramjet uses codecs for URL encoding
                // The codec is loaded from scramjet.codecs.js
                if (typeof __scramjet$codecs !== 'undefined') {
                    const encoded = __scramjet$codecs.xor.encode(url);
                    proxiedUrl = '/scramjet/service/' + encoded;
                } else {
                    console.error('Scramjet codecs not loaded');
                    return;
                }
            } else {
                console.error('Proxy backend not properly initialized');
                return;
            }

            // Open in iframe
            this.proxyFrame.src = proxiedUrl;
            this.proxyFrame.style.display = 'block';
            this.proxyFrame.classList.add('active');

        } catch (error) {
            console.error('Error opening proxied URL:', error);
            alert('Failed to open URL through proxy. Please check console for details.');
        }
    }

    // Load settings from localStorage
    loadSettings() {
        const defaultSettings = {
            proxyBackend: 'ultraviolet',
            transport: 'bare',
            searchEngine: 'duckduckgo',
            clearCookies: true,
            blockAds: true
        };

        try {
            const saved = localStorage.getItem('proxySettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    // Save settings to localStorage
    saveSettings() {
        const settings = {
            proxyBackend: document.querySelector('input[name="proxy-backend"]:checked')?.value || 'ultraviolet',
            transport: document.querySelector('input[name="transport"]:checked')?.value || 'bare',
            searchEngine: document.getElementById('search-engine')?.value || 'duckduckgo',
            clearCookies: document.getElementById('clear-cookies')?.checked || false,
            blockAds: document.getElementById('block-ads')?.checked || false
        };

        try {
            localStorage.setItem('proxySettings', JSON.stringify(settings));
            this.settings = settings;
            
            // Reinitialize proxy with new settings
            this.initProxyBackend();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Apply saved settings to UI
    applySavedSettings() {
        // Proxy backend
        const backendRadio = document.querySelector(`input[name="proxy-backend"][value="${this.settings.proxyBackend}"]`);
        if (backendRadio) backendRadio.checked = true;

        // Transport
        const transportRadio = document.querySelector(`input[name="transport"][value="${this.settings.transport}"]`);
        if (transportRadio) transportRadio.checked = true;

        // Search engine
        const searchEngineSelect = document.getElementById('search-engine');
        if (searchEngineSelect) searchEngineSelect.value = this.settings.searchEngine;

        // Checkboxes
        const clearCookiesCheckbox = document.getElementById('clear-cookies');
        if (clearCookiesCheckbox) clearCookiesCheckbox.checked = this.settings.clearCookies;

        const blockAdsCheckbox = document.getElementById('block-ads');
        if (blockAdsCheckbox) blockAdsCheckbox.checked = this.settings.blockAds;
    }

    // Check server status
    async checkServerStatus() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            
            if (data.status === 'ok') {
                document.getElementById('status-text').textContent = 'Connected';
                console.log('✓ Server status:', data);
            }
        } catch (error) {
            document.getElementById('status-text').textContent = 'Connection Error';
            console.error('Server status check failed:', error);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProxyApp();
    });
} else {
    new ProxyApp();
}

// Add close button for proxy frame
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const frame = document.getElementById('proxy-frame');
        if (frame.classList.contains('active')) {
            frame.style.display = 'none';
            frame.classList.remove('active');
        }
    }
});
