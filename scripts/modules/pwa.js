/**
 * PWA Module
 * Handles all PWA-related functionality including:
 * - Service worker registration
 * - Offline detection
 * - PWA installation prompt
 * - Cache management
 * - Status notifications
 */

/**
 * PWA state tracking
 */
const pwaState = {
  deferredPrompt: null,
  registration: null,
  offlineNotificationDismissed: false,
  updateAvailable: false
};

/**
 * Initialize HTML elements for PWA UI
 */
function createPwaElements() {
  // Create offline status notification
  if (!document.getElementById('offline-status')) {
    const offlineStatus = document.createElement('div');
    offlineStatus.id = 'offline-status';
    offlineStatus.className = 'offline-status';
    offlineStatus.style.display = 'none';
    
    offlineStatus.innerHTML = `
      <div class="offline-content">
        <i class="fas fa-wifi"></i> You are currently offline. Some features may be limited.
        <button id="dismiss-offline" class="dismiss-btn" aria-label="Dismiss notification">×</button>
      </div>
    `;
    
    document.body.appendChild(offlineStatus);
  }
  
  // Create PWA install prompt
  if (!document.getElementById('pwa-install-prompt')) {
    const installPrompt = document.createElement('div');
    installPrompt.id = 'pwa-install-prompt';
    installPrompt.className = 'pwa-prompt';
    installPrompt.style.display = 'none';
    
    installPrompt.innerHTML = `
      <div class="pwa-prompt-content">
        <i class="fas fa-download"></i>
        <div class="pwa-prompt-text">
          <p><strong>Install Royal Eleganto</strong></p>
          <p>Add our app to your home screen for a better experience</p>
        </div>
        <div class="pwa-prompt-buttons">
          <button id="pwa-install-button" class="btn-primary">Install</button>
          <button id="pwa-dismiss-button" class="btn-secondary">Not Now</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(installPrompt);
  }
  
  // Create update notification
  if (!document.getElementById('update-notification')) {
    const updateNotification = document.createElement('div');
    updateNotification.id = 'update-notification';
    updateNotification.className = 'update-notification';
    updateNotification.style.display = 'none';
    
    updateNotification.innerHTML = `
      <div class="update-content">
        <i class="fas fa-sync-alt"></i> A new version is available
        <button id="update-button" class="btn-primary update-button">Update Now</button>
        <button id="dismiss-update" class="dismiss-btn" aria-label="Dismiss notification">×</button>
      </div>
    `;
    
    document.body.appendChild(updateNotification);
  }
  
  // Add CSS for PWA UI elements
  if (!document.getElementById('pwa-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent = `
      /* Offline Status Message */
      .offline-status, .update-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background-color: var(--color-primary);
        color: var(--color-white);
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        max-width: 300px;
      }
      
      .offline-content, .update-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .offline-status i, .update-notification i {
        color: var(--color-accent);
        font-size: 1.2rem;
      }
      
      .dismiss-btn {
        background: none;
        border: none;
        color: var(--color-white);
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 10px;
        padding: 0 5px;
      }
      
      .dismiss-btn:hover {
        color: var(--color-accent);
      }
      
      .update-button {
        font-size: 0.8rem;
        padding: 5px 10px;
        margin-left: 10px;
      }
      
      /* PWA Install Prompt */
      .pwa-prompt {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--color-primary);
        color: var(--color-white);
        border-radius: 5px;
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        max-width: 320px;
        overflow: hidden;
      }
      
      .pwa-prompt-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .pwa-prompt i {
        color: var(--color-accent);
        font-size: 2rem;
        margin-bottom: 10px;
      }
      
      .pwa-prompt-text {
        margin-bottom: 15px;
      }
      
      .pwa-prompt-text p {
        margin: 5px 0;
      }
      
      .pwa-prompt-buttons {
        display: flex;
        gap: 10px;
      }
      
      .pwa-prompt-buttons button {
        font-size: 0.9rem;
        padding: 8px 15px;
      }
    `;
    
    document.head.appendChild(style);
  }
}

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      pwaState.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registered with scope:', pwaState.registration.scope);
      
      // Check for updates
      pwaState.registration.addEventListener('updatefound', () => {
        const newWorker = pwaState.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is installed, but waiting to activate
            pwaState.updateAvailable = true;
            showUpdateNotification();
          }
        });
      });
      
      // Handle controller change (when a new service worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed');
      });
      
      return pwaState.registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service workers are not supported in this browser');
    return null;
  }
}

/**
 * Update online/offline status
 */
export function updateOnlineStatus() {
  const offlineStatus = document.getElementById('offline-status');
  if (!offlineStatus) return;
  
  if (!navigator.onLine && !pwaState.offlineNotificationDismissed) {
    offlineStatus.style.display = 'block';
  } else {
    offlineStatus.style.display = 'none';
  }
}

/**
 * Show update notification
 */
export function showUpdateNotification() {
  const updateNotification = document.getElementById('update-notification');
  if (updateNotification && pwaState.updateAvailable) {
    updateNotification.style.display = 'block';
  }
}

/**
 * Apply service worker update
 */
export function applyUpdate() {
  if (pwaState.registration && pwaState.registration.waiting) {
    // Send message to service worker to skip waiting
    pwaState.registration.waiting.postMessage({ action: 'skipWaiting' });
  }
}

/**
 * Setup PWA install prompt
 */
export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Store the event so it can be triggered later
    pwaState.deferredPrompt = event;
    
    // Show the install prompt after a delay if not previously dismissed
    setTimeout(() => {
      const installPrompt = document.getElementById('pwa-install-prompt');
      
      if (installPrompt && pwaState.deferredPrompt && !localStorage.getItem('pwa_prompt_dismissed')) {
        installPrompt.style.display = 'block';
      }
    }, 5000);
  });
}

/**
 * Show PWA install prompt
 */
export async function showInstallPrompt() {
  if (!pwaState.deferredPrompt) return;
  
  // Hide our custom install prompt
  const installPrompt = document.getElementById('pwa-install-prompt');
  if (installPrompt) {
    installPrompt.style.display = 'none';
  }
  
  // Show the browser install prompt
  pwaState.deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await pwaState.deferredPrompt.userChoice;
  console.log(`User ${outcome} the installation`);
  
  // Clear the deferred prompt variable
  pwaState.deferredPrompt = null;
}

/**
 * Dismiss PWA install prompt
 */
export function dismissInstallPrompt() {
  const installPrompt = document.getElementById('pwa-install-prompt');
  if (installPrompt) {
    installPrompt.style.display = 'none';
  }
  
  // Set a flag in localStorage to not show the prompt for 30 days
  localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  
  // Set timeout to clear the flag after 30 days
  setTimeout(() => {
    localStorage.removeItem('pwa_prompt_dismissed');
  }, 30 * 24 * 60 * 60 * 1000); // 30 days
}

/**
 * Initialize event listeners for PWA UI elements
 */
export function initializeEventListeners() {
  // Dismiss offline notification
  document.getElementById('dismiss-offline')?.addEventListener('click', () => {
    const offlineStatus = document.getElementById('offline-status');
    if (offlineStatus) {
      offlineStatus.style.display = 'none';
      pwaState.offlineNotificationDismissed = true;
    }
  });
  
  // Install button
  document.getElementById('pwa-install-button')?.addEventListener('click', () => {
    showInstallPrompt();
  });
  
  // Dismiss install prompt
  document.getElementById('pwa-dismiss-button')?.addEventListener('click', () => {
    dismissInstallPrompt();
  });
  
  // Update button
  document.getElementById('update-button')?.addEventListener('click', () => {
    applyUpdate();
    window.location.reload();
  });
  
  // Dismiss update notification
  document.getElementById('dismiss-update')?.addEventListener('click', () => {
    const updateNotification = document.getElementById('update-notification');
    if (updateNotification) {
      updateNotification.style.display = 'none';
    }
  });
}

/**
 * Initialize PWA features
 */
export function initPwa() {
  // Create UI elements
  createPwaElements();
  
  // Register service worker
  registerServiceWorker().catch(console.error);
  
  // Set up online/offline status handling
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
  
  // Set up install prompt
  setupInstallPrompt();
  
  // Initialize event listeners
  initializeEventListeners();
}

export default {
  initPwa,
  registerServiceWorker,
  updateOnlineStatus,
  showUpdateNotification,
  applyUpdate,
  showInstallPrompt,
  dismissInstallPrompt
};

