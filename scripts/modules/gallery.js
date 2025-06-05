/**
 * Gallery Module
 * Handles all gallery-related functionality including:
 * - Gallery filtering with transitions
 * - Modal functionality with keyboard navigation
 * - Image lazy loading
 * - Accessibility improvements
 * - Touch support for mobile devices
 * - Preloading of adjacent images
 * - Error handling for failed images
 */

/**
 * Gallery state to track current items and selected item
 */
const galleryState = {
  items: [],
  currentIndex: -1,
  isModalOpen: false,
  touchStartX: 0,
  touchEndX: 0,
  swipeThreshold: 50,
  preloadedImages: new Set()
};

/**
 * Initialize the gallery filtering functionality
 */
export function initGalleryFilter() {
  const filterButtons = document.querySelectorAll('.gallery-filter .filter-btn, .pricing-filter .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item, .pricing-item');
  
  if (filterButtons.length === 0 || galleryItems.length === 0) return;
  
  // Store original items for reference
  galleryState.items = Array.from(galleryItems);
  
  // Set initial state with all items visible
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) {
    const initialFilter = activeFilter.getAttribute('data-filter');
    if (initialFilter && initialFilter !== 'all') {
      filterGalleryItems(initialFilter, galleryItems);
    }
  }
  
  // Add click event to filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filterValue = this.getAttribute('data-filter');
      
      // Skip if already active
      if (this.classList.contains('active')) return;
      
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter the items
      filterGalleryItems(filterValue, galleryItems);
      
      // Announce to screen readers
      const liveRegion = getOrCreateLiveRegion();
      liveRegion.textContent = `Filtered to show ${filterValue === 'all' ? 'all items' : filterValue + ' items'}`;
    });
    
    // Add keyboard support
    button.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.click();
      }
    });
  });
}

/**
 * Filter gallery items based on category
 * @param {string} filterValue The category to filter by, or 'all'
 * @param {NodeList} items The gallery items to filter
 */
function filterGalleryItems(filterValue, items) {
  items.forEach(item => {
    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
      // First set display to block so the item can transition
      if (item.style.display === 'none') {
        item.style.display = 'block';
        // Force reflow to ensure transitions work
        item.offsetHeight;
      }
      
      // Then animate in
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      }, 10);
    } else {
      // Animate out
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      
      // Hide after transition
      setTimeout(() => {
        item.style.display = 'none';
      }, 300);
    }
  });
}

/**
 * Initialize the gallery modal functionality
 */
export function initGalleryModal() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryZoomButtons = document.querySelectorAll('.gallery-zoom');
  
  if (galleryZoomButtons.length === 0) return;
  
  // Check if modal exists, create if not
  let modal = document.getElementById('gallery-modal');
  if (!modal) {
    modal = createGalleryModal();
  }
  
  // Store gallery items for navigation
  galleryState.items = Array.from(galleryItems);
  
  // Add click event to zoom buttons
  galleryZoomButtons.forEach((button, index) => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      openGalleryModal(index);
    });
    
    // Add keyboard support
    button.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openGalleryModal(index);
      }
    });
  });
  
  // Add touch support
  modal.addEventListener('touchstart', handleTouchStart);
  modal.addEventListener('touchend', handleTouchEnd);
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleModalKeyboard);
}

/**
 * Create the gallery modal if it doesn't exist
 * @returns {HTMLElement} The created modal element
 */
function createGalleryModal() {
  const modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.setAttribute('aria-hidden', 'true');
  
  modal.innerHTML = `
    <span class="modal-close" role="button" tabindex="0" aria-label="Close modal">&times;</span>
    <div class="modal-content-wrapper">
      <button class="modal-nav modal-prev" aria-label="Previous image">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="modal-content-container">
        <img id="modal-img" class="modal-content" alt="" src="">
        <div class="modal-loading">
          <div class="spinner"></div>
        </div>
        <div class="modal-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Image failed to load</p>
          <button class="btn-secondary modal-retry">Retry</button>
        </div>
      </div>
      <button class="modal-nav modal-next" aria-label="Next image">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <div id="modal-caption">
      <h3 id="modal-title"></h3>
      <p id="modal-description"></p>
    </div>
    <div class="modal-counter" aria-live="polite">
      <span id="current-index"></span> of <span id="total-count"></span>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', closeGalleryModal);
  
  const prevBtn = modal.querySelector('.modal-prev');
  prevBtn.addEventListener('click', () => navigateGallery('prev'));
  
  const nextBtn = modal.querySelector('.modal-next');
  nextBtn.addEventListener('click', () => navigateGallery('next'));
  
  const retryBtn = modal.querySelector('.modal-retry');
  retryBtn.addEventListener('click', () => retryLoadImage());
  
  // Close when clicking outside the image
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeGalleryModal();
    }
  });
  
  return modal;
}

/**
 * Open the gallery modal with a specific item
 * @param {number} index The index of the item to show
 */
function openGalleryModal(index) {
  // Verify index is valid
  if (index < 0 || index >= galleryState.items.length) return;
  
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  
  // Update state
  galleryState.currentIndex = index;
  galleryState.isModalOpen = true;
  
  // Make sure focusable elements have tabindex
  ensureModalAccessibility(modal);
  
  // Load the image
  loadImageIntoModal(index);
  
  // Update modal counter
  updateModalCounter();
  
  // Show modal
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
  
  // Set focus to modal
  modal.focus();
  
  // Preload adjacent images
  preloadAdjacentImages(index);
  
  // Trap focus inside modal
  trapFocusInModal(modal);
  
  // Prevent page scrolling
  document.body.style.overflow = 'hidden';
}

/**
 * Close the gallery modal
 */
function closeGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  
  // Update state
  galleryState.isModalOpen = false;
  
  // Hide modal
  modal.style.opacity = '0';
  setTimeout(() => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Clear image src to prevent memory issues
    const modalImg = document.getElementById('modal-img');
    if (modalImg) {
      modalImg.src = '';
    }
    
    // Reset error state
    resetModalErrorState();
  }, 300);
  
  // Restore page scrolling
  document.body.style.overflow = '';
  
  // Return focus to the element that opened the modal
  const originButton = galleryState.items[galleryState.currentIndex]?.querySelector('.gallery-zoom');
  if (originButton) {
    originButton.focus();
  }
}

/**
 * Navigate the gallery to the previous or next image
 * @param {string} direction Either 'prev' or 'next'
 */
function navigateGallery(direction) {
  if (!galleryState.isModalOpen) return;
  
  const items = galleryState.items;
  let newIndex = galleryState.currentIndex;
  
  if (direction === 'prev') {
    newIndex = (newIndex - 1 + items.length) % items.length;
  } else {
    newIndex = (newIndex + 1) % items.length;
  }
  
  // Check if the item is currently visible (not filtered out)
  while (items[newIndex].style.display === 'none' && newIndex !== galleryState.currentIndex) {
    if (direction === 'prev') {
      newIndex = (newIndex - 1 + items.length) % items.length;
    } else {
      newIndex = (newIndex + 1) % items.length;
    }
  }
  
  if (newIndex !== galleryState.currentIndex) {
    galleryState.currentIndex = newIndex;
    loadImageIntoModal(newIndex);
    updateModalCounter();
    preloadAdjacentImages(newIndex);
    
    // Announce to screen readers
    const liveRegion = getOrCreateLiveRegion();
    liveRegion.textContent = `Image ${newIndex + 1} of ${items.length}`;
  }
}

/**
 * Load an image into the modal
 * @param {number} index The index of the item to show
 */
function loadImageIntoModal(index) {
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalLoading = modal.querySelector('.modal-loading');
  const modalError = modal.querySelector('.modal-error');
  
  if (!modal || !modalImg) return;
  
  // Get the gallery item
  const item = galleryState.items[index];
  if (!item) return;
  
  // Get image and information
  const img = item.querySelector('img');
  const heading = item.querySelector('h3')?.textContent || '';
  const description = item.querySelector('p')?.textContent || '';
  
  // Set modal content text
  modalTitle.textContent = heading;
  modalDescription.textContent = description;
  modalImg.alt = heading;
  
  // Show loading state
  modalLoading.style.display = 'flex';
  modalError.style.display = 'none';
  modalImg.style.display = 'none';
  
  // Load image
  if (img && img.src) {
    // If already preloaded, use from cache
    if (galleryState.preloadedImages.has(img.src)) {
      modalImg.src = img.src;
      modalImg.style.display = 'block';
      modalLoading.style.display = 'none';
    } else {
      // Otherwise load it
      modalImg.src = img.src;
      
      modalImg.onload = function() {
        modalImg.style.display = 'block';
        modalLoading.style.display = 'none';
        galleryState.preloadedImages.add(img.src);
      };
      
      modalImg.onerror = function() {
        modalLoading.style.display = 'none';
        modalError.style.display = 'flex';
        modalImg.style.display = 'none';
      };
    }
  } else {
    // Handle case where image doesn't exist
    modalLoading.style.display = 'none';
    modalError.style.display = 'flex';
    modalImg.style.display = 'none';
  }
}

/**
 * Retry loading the current image
 */
function retryLoadImage() {
  loadImageIntoModal(galleryState.currentIndex);
}

/**
 * Reset the modal error state
 */
function resetModalErrorState() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  
  const modalLoading = modal.querySelector('.modal-loading');
  const modalError = modal.querySelector('.modal-error');
  const modalImg = document.getElementById('modal-img');
  
  if (modalLoading) modalLoading.style.display = 'none';
  if (modalError) modalError.style.display = 'none';
  if (modalImg) modalImg.style.display = 'block';
}

/**
 * Update the modal counter
 */
function updateModalCounter() {
  const currentIndexEl = document.getElementById('current-index');
  const totalCountEl = document.getElementById('total-count');
  
  if (currentIndexEl && totalCountEl) {
    currentIndexEl.textContent = galleryState.currentIndex + 1;
    totalCountEl.textContent = galleryState.items.length;
  }
}

/**
 * Preload adjacent images for smoother navigation
 * @param {number} index The current index
 */
function preloadAdjacentImages(index) {
  const items = galleryState.items;
  if (!items.length) return;
  
  // Preload next and previous images
  const nextIndex = (index + 1) % items.length;
  const prevIndex = (index - 1 + items.length) % items.length;
  
  // Helper function to preload
  const preloadImage = (idx) => {
    const item = items[idx];
    if (!item) return;
    
    const img = item.querySelector('img');
    if (img && img.src && !galleryState.preloadedImages.has(img.src)) {
      const preloader = new Image();
      preloader.onload = function() {
        galleryState.preloadedImages.add(img.src);
      };
      preloader.src = img.src;
    }
  };
  
  // Preload next and previous images
  preloadImage(nextIndex);
  preloadImage(prevIndex);
}

/**
 * Handle touch start event for swiping
 * @param {TouchEvent} event The touch event
 */
function handleTouchStart(event) {
  galleryState.touchStartX = event.changedTouches[0].screenX;
}

/**
 * Handle touch end event for swiping
 * @param {TouchEvent} event The touch event
 */
function handleTouchEnd(event) {
  galleryState.touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
}

/**
 * Handle swipe gesture
 */
function handleSwipe() {
  const diffX = galleryState.touchEndX - galleryState.touchStartX;
  
  if (Math.abs(diffX) > galleryState.swipeThreshold) {
    if (diffX > 0) {
      // Swipe right - go to previous
      navigateGallery('prev');
    } else {
      // Swipe left - go to next
      navigateGallery('next');
    }
  }
}

/**
 * Handle keyboard events for modal navigation
 * @param {KeyboardEvent} event The keyboard event
 */
function handleModalKeyboard(event) {
  if (!galleryState.isModalOpen) return;
  
  switch (event.key) {
    case 'Escape':
      closeGalleryModal();
      break;
    case 'ArrowLeft':
      navigateGallery('prev');
      break;
    case 'ArrowRight':
      navigateGallery('next');
      break;
  }
}

/**
 * Ensure all focusable elements in modal have proper tabindex
 * @param {HTMLElement} modal The modal element
 */
function ensureModalAccessibility(modal) {
  // Make sure modal can be focused
  modal.setAttribute('tabindex', '-1');
  
  // Make navigation buttons focusable
  const focusableElements = modal.querySelectorAll('button, [tabindex], .modal-close');
  focusableElements.forEach(el => {
    if (!el.getAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
    }
  });
}

/**
 * Trap focus inside the modal when it's open
 * @param {HTMLElement} modal The modal element
 */
function trapFocusInModal(modal) {
  const focusableElements = modal.querySelectorAll('button, [tabindex], .modal-close');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  // Handle tabbing while modal is open
  modal.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
      // Shift+Tab
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
      // Tab
      else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

/**
 * Get or create a live region for accessibility announcements
 * @returns {HTMLElement} The live region element
 */
function getOrCreateLiveRegion() {
  let liveRegion = document.getElementById('gallery-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'gallery-live-region';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  
  return liveRegion;
}

/**
 * Initialize lazy loading for all gallery images
 */
export function initLazyLoading() {
  // Check if the browser supports IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            
            // Handle load errors
            img.addEventListener('error', function() {
              this.classList.add('img-error');
              // Replace with placeholder if needed
              this.src = 'images/placeholder.jpg';
            });
            
            // Remove observer after loading
            observer.unobserve(img);
          }
        }
      });
    });
    
    // Target all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

/**
 * Initialize all gallery features
 */
export function initGallery() {
  initGalleryFilter();
  initGalleryModal();
  initLazyLoading();
}

export default {
  initGallery,
  initGalleryFilter,
  initGalleryModal,
  initLazyLoading
};

