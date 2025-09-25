const CACHE_NAME = 'creaiter-v2';
const CACHE_VERSION = '2.0.0';
const DATA_CACHE_NAME = 'creaiter-data-v1';

// Enhanced cache strategy configuration
const CACHE_STRATEGIES = {
  STATIC: {
    name: `${CACHE_NAME}-static`,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100
  },
  DYNAMIC: {
    name: `${CACHE_NAME}-dynamic`,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 50
  },
  API: {
    name: `${CACHE_NAME}-api`,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 100
  },
  IMAGES: {
    name: `${CACHE_NAME}-images`,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 60
  }
};

// Static assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/ai-chat',
  '/enterprise',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/conversations/,
  /\/api\/workflows/,
  /\/api\/content/
];

// Background sync queue
const BACKGROUND_SYNC_TAG = 'creaiter-background-sync';

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STRATEGIES.STATIC.name).then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      self.skipWaiting() // Force activation of new service worker
    ])
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('creaiter-') && 
                !Object.values(CACHE_STRATEGIES).some(strategy => strategy.name === cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
  
  // Notify clients about update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: CACHE_VERSION
      });
    });
  });
});

// Enhanced fetch handler with intelligent caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First strategy
    if (isStaticAsset(url)) {
      return await cacheFirst(request, CACHE_STRATEGIES.STATIC);
    }
    
    // Images - Cache First strategy
    if (isImageRequest(request)) {
      return await cacheFirst(request, CACHE_STRATEGIES.IMAGES);
    }
    
    // API requests - Network First with fallback
    if (isAPIRequest(url)) {
      return await networkFirstWithFallback(request, CACHE_STRATEGIES.API);
    }
    
    // HTML pages - Stale While Revalidate
    if (isHTMLRequest(request)) {
      return await staleWhileRevalidate(request, CACHE_STRATEGIES.DYNAMIC);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await getOfflineFallback(request);
  }
}

// Cache First strategy (for static assets)
async function cacheFirst(request, cacheStrategy) {
  const cache = await caches.open(cacheStrategy.name);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is expired
    const cacheTime = await getCacheTime(cache, request);
    if (Date.now() - cacheTime < cacheStrategy.maxAge) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await updateCache(cache, request, networkResponse.clone(), cacheStrategy);
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || createErrorResponse('Network unavailable');
  }
}

// Network First with API fallback
async function networkFirstWithFallback(request, cacheStrategy) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheStrategy.name);
      await updateCache(cache, request, networkResponse.clone(), cacheStrategy);
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheStrategy.name);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Queue for background sync if POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      await queueBackgroundSync(request);
    }
    
    return createErrorResponse('API unavailable');
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheStrategy) {
  const cache = await caches.open(cacheStrategy.name);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkResponsePromise = fetch(request).then(async (response) => {
    if (response.ok) {
      await updateCache(cache, request, response.clone(), cacheStrategy);
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    networkResponsePromise; // Fire and forget
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return await networkResponsePromise || createErrorResponse('Content unavailable');
}

// Network First strategy
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return createErrorResponse('Network unavailable');
  }
}

// Helper functions
function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/.test(url.pathname);
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|webp|svg)$/.test(new URL(request.url).pathname);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isHTMLRequest(request) {
  return request.destination === 'document' ||
         request.headers.get('accept')?.includes('text/html');
}

async function updateCache(cache, request, response, cacheStrategy) {
  // Store with timestamp for expiry checking
  const responseWithTimestamp = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'sw-cache-time': Date.now().toString()
    }
  });
  
  await cache.put(request, responseWithTimestamp);
  await limitCacheSize(cache, cacheStrategy.maxEntries);
}

async function getCacheTime(cache, request) {
  const response = await cache.match(request);
  return response ? parseInt(response.headers.get('sw-cache-time') || '0') : 0;
}

async function limitCacheSize(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Remove oldest entries
    const sortedKeys = await Promise.all(
      keys.map(async (key) => ({
        key,
        time: await getCacheTime(cache, key)
      }))
    );
    
    sortedKeys.sort((a, b) => a.time - b.time);
    const keysToDelete = sortedKeys.slice(0, keys.length - maxEntries);
    
    await Promise.all(keysToDelete.map(({ key }) => cache.delete(key)));
  }
}

async function getOfflineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(CACHE_STRATEGIES.DYNAMIC.name);
    return await cache.match('/') || createErrorResponse('Offline');
  }
  return createErrorResponse('Resource unavailable offline');
}

function createErrorResponse(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(handleBackgroundSync());
  }
});

async function queueBackgroundSync(request) {
  try {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(BACKGROUND_SYNC_TAG);
      
      // Store request for later processing
      const db = await openIndexedDB();
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      await store.add({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('[SW] Error queuing background sync:', error);
  }
}

async function handleBackgroundSync() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          await store.delete(requestData.id);
          console.log('[SW] Background sync successful for:', requestData.url);
        }
      } catch (error) {
        console.error('[SW] Background sync failed for:', requestData.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync handler error:', error);
  }
}

// IndexedDB helper
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('creaiter-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => name.startsWith('creaiter-'))
      .map(name => caches.delete(name))
  );
}

console.log('[SW] Service Worker script loaded, version:', CACHE_VERSION);