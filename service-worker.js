/**
 * Royal Eleganto Service Worker
 * Provides offline functionality, caching, and PWA features
 */

// Cache names with version control
const CACHE_NAMES = {
  static: 'royal-eleganto-static-v1',
  images: 'royal-eleganto-images-v1',
  fonts: 'royal-eleganto-fonts-v1',
  dynamic: 'royal-eleganto-dynamic-v1',
  pages: 'royal-eleganto-pages-v1'
};

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/gallery.html',
  '/contact.html',
  '/privacy-policy.html',
  '/terms-of-service.html',
  '/offline.html', // Offline fallback page
  '/styles/main.css',
  '/scripts/main.js',
  '/scripts/modules/navigation.js',
  '/scripts/modules/forms.js',
  '/scripts/modules/gallery.js',
  '/scripts/modules/animation.js',
  '/scripts/modules/utils.js',
  '/manifest.json',
  '/images/royal-eleganto.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// Image extensions to cache with image strategy
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];

// Font extensions to cache with font strategy
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.eot'];

/**
 * Helper function to clean up old caches
 */
const deleteOldCaches = async () => {
  const cacheKeepList = Object.values(CACHE_NAMES);
  const cacheList = await caches.keys();
  const cachesToDelete = cacheList.filter(cacheName => !cacheKeepList.includes(cacheName));
  return Promise.all(cachesToDelete.map(cacheName => {
    console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
    return caches.delete(cacheName);
  }));
};

/**
 * Helper function to determine cache name based on request
 */
const getCacheNameForRequest = (request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Check for image extensions
  if (IMAGE_EXTENSIONS.some(ext => path.endsWith(ext))) {
    return CACHE_NAMES.images;
  }

  // Check for font extensions
  if (FONT_EXTENSIONS.some(ext => path.endsWith(ext))) {
    return CACHE_NAMES.fonts;
  }

  // Check for HTML pages
  if (path.endsWith('.html') || path === '/' || path === '') {
    return CACHE_NAMES.pages;
  }

  // Default to static cache
  return CACHE_NAMES.static;
};

/**
 * Handle errors consistently and log them
 * @param {Error} error The error to handle
 * @param {string} context Context where the error occurred
 */
const handleError = (error, context) => {
  console.error(`[Service Worker] Error in ${context}:`, error);
};

/**
 * Install event handler
 * Cache all static resources
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(CACHE_NAMES.static);
        console.log('[Service Worker] Caching static assets');
        await staticCache.addAll(STATIC_ASSETS);
        console.log('[Service Worker] All static assets cached successfully');
      } catch (error) {
        handleError(error, 'install event');
      }
      
      // Activate immediately
      await self.skipWaiting();
      console.log('[Service Worker] Installed and activated');
    })()
  );
});

/**
 * Activate event handler
 * Clean up old caches and claim clients
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Remove old cache versions
        await deleteOldCaches();
        
        // Claim clients so the service worker is in control without reload
        await self.clients.claim();
        console.log('[Service Worker] Activated and claimed clients');
      } catch (error) {
        handleError(error, 'activate event');
      }
    })()
  );
});

/**
 * Fetch event handler
 * Implements different caching strategies based on request type
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-GET requests and browser extension requests
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Define strategy based on request type
  let fetchStrategy;
  
  // Check if this is an API request
  if (request.url.includes('/api/')) {
    fetchStrategy = networkFirstStrategy;
  }
  // Check if this is a navigation request (HTML page)
  else if (request.mode === 'navigate') {
    fetchStrategy = networkFirstWithOfflineFallback;
  }
  // Check if this is an image request
  else if (IMAGE_EXTENSIONS.some(ext => request.url.endsWith(ext))) {
    fetchStrategy = cacheFirstStrategy;
  }
  // For everything else, use stale-while-revalidate
  else {
    fetchStrategy = staleWhileRevalidateStrategy;
  }
  
  // Execute the selected strategy
  event.respondWith(fetchStrategy(request));
});

/**
 * Cache-first strategy
 * Try cache first, if not found fetch from network and cache the response
 * @param {Request} request The fetch request
 */
async function cacheFirstStrategy(request) {
  const cacheName = getCacheNameForRequest(request);
  
  try {
    // Try to find in cache
    const cachedResponse = await caches.match(request);
    
    // If found in cache, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response if it's valid
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    handleError(error, 'cache-first strategy');
    
    // For images, return a placeholder
    if (IMAGE_EXTENSIONS.some(ext => request.url.endsWith(ext))) {
      return caches.match('/images/placeholder.jpg');
    }
    
    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, if fails fall back to cache
 * @param {Request} request The fetch request
 */
async function networkFirstStrategy(request) {
  const cacheName = getCacheNameForRequest(request);
  
  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response if it's valid
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    handleError(error, 'network-first strategy');
    throw error;
  }
}

/**
 * Network-first with offline fallback
 * Try network first, if fails fall back to cache, if cache fails show offline page
 * @param {Request} request The fetch request
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    // Try network-first strategy
    return await networkFirstStrategy(request);
  } catch (error) {
    console.log('[Service Worker] Falling back to offline page');
    // If both network and cache fail, show offline page
    return caches.match('/offline.html');
  }
}

/**
 * Stale-while-revalidate strategy
 * Return from cache if available, then fetch from network and update cache for next time
 * @param {Request} request The fetch request
 */
async function staleWhileRevalidateStrategy(request) {
  const cacheName = getCacheNameForRequest(request);
  
  try {
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    
    // Fetch from network to update cache (don't await)
    const fetchPromise = fetch(request)
      .then(networkResponse => {
        // Cache the updated response
        if (networkResponse && networkResponse.status === 200) {
          const cache = caches.open(cacheName)
            .then(cache => cache.put(request, networkResponse.clone()))
            .catch(error => handleError(error, 'stale-while-revalidate cache update'));
        }
        return networkResponse;
      })
      .catch(error => handleError(error, 'stale-while-revalidate network fetch'));
    
    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise wait for the network response
    return await fetchPromise;
  } catch (error) {
    handleError(error, 'stale-while-revalidate strategy');
    throw error;
  }
}

/**
 * Background sync event handler for form submissions
 */
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    console.log('[Service Worker] Background syncing contact form data');
    event.waitUntil(syncContactForm());
  }
});

/**
 * Process stored form submissions when back online
 */
async function syncContactForm() {
  try {
    // Get stored form submissions
    const storedSubmissionsStr = localStorage.getItem('pending_form_submissions');
    
    if (!storedSubmissionsStr) {
      return;
    }
    
    const storedSubmissions = JSON.parse(storedSubmissionsStr);
    
    if (storedSubmissions.length === 0) {
      return;
    }
    
    console.log(`[Service Worker] Processing ${storedSubmissions.length} pending form submissions`);
    
    // Process each stored submission
    for (const submission of storedSubmissions) {
      try {
        // In a real app, send to server here
        console.log('[Service Worker] Processed form submission:', submission);
        
        // Remove from pending submissions
        const updatedSubmissions = storedSubmissions.filter(item => item.id !== submission.id);
        localStorage.setItem('pending_form_submissions', JSON.stringify(updatedSubmissions));
        
        // Send notification of success
        self.registration.showNotification('Form Submitted', {
          body: 'Your contact form was successfully submitted',
          icon: '/images/icons/icon-192x192.png'
        });
      } catch (error) {
        handleError(error, `processing form submission ${submission.id}`);
      }
    }
  } catch (error) {
    handleError(error, 'syncContactForm');
  }
}

/**
 * Push notification event handler
 */
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received');
  
  try {
    let notificationData = {};
    
    // Parse the notification data if available
    if (event.data) {
      notificationData = event.data.json();
    }
    
    // Set default values if not provided
    const title = notificationData.title || 'Royal Eleganto';
    const options = {
      body: notificationData.body || 'You have a new notification',
      icon: notificationData.icon || '/images/icons/icon-192x192.png',
      badge: '/images/icons/badge-128x128.png',
      data: {
        url: notificationData.url || '/'
      }
    };
    
    // Show the notification
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    handleError(error, 'push event');
  }
});

/**
 * Notification click event handler
 */
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked');
  
  try {
    event.notification.close();
    
    // Get the URL from the notification data
    const url = event.notification.data.url || '/';
    
    // Open or focus the relevant page
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // Check if there's already a window open with the target URL
          for (const client of windowClients) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  } catch (error) {
    handleError(error, 'notificationclick event');
  }
});

/**
 * Message event handler
 * For communication between the service worker and the main thread
 */
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received', event.data);
  
  try {
    if (event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
  } catch (error) {
    handleError(error, 'message event');
  }
});

console.log('[Service Worker] Loaded successfully');

