// Service Worker for ExamPrep React PWA
const CACHE_NAME = 'examprep-react-v1';

// Static assets to cache
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    }).catch(err => {
      console.error('Cache installation failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('📦 Serving from cache:', event.request.url);
            return response;
          }
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Return a basic offline response
          return new Response(
            'Offline - Please check your internet connection',
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            }
          );
        });
      })
  );
});

// Message event - handle cache updates and skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_QUESTION_SET') {
    // Cache question set data for offline access
    const { questionSetId, data } = event.data;
    caches.open(CACHE_NAME).then((cache) => {
      const cacheKey = `/offline/questions/${questionSetId}`;
      cache.put(
        new Request(cacheKey),
        new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      console.log('💾 Question set cached for offline access:', questionSetId);
    });
  }
});

// Background sync event (for future implementation)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    console.log('🔄 Background sync triggered: sync-progress');
    // Sync progress data when connection is restored
    event.waitUntil(syncProgressData());
  }
});

async function syncProgressData() {
  // This will be implemented when background sync is needed
  console.log('💾 Syncing progress data...');
  return Promise.resolve();
}

