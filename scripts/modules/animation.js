/**
 * Animation Module
 * Handles all animation-related functionality including:
 * - Scroll-based animations using IntersectionObserver
 * - Reduced motion support
 * - Placeholder animations
 * - Loading animations
 * - Smooth transitions
 * - Performance monitoring
 */

import { throttle } from './utils.js';

/**
 * Animation state and configuration
 */
const animationState = {
  // Track active animations
  activeAnimations: new Set(),
  // Performance monitoring
  lastFrameTime: 0,
  frameCount: 0,
  frameTimes: [],
  // Configuration
  animationThreshold: 0.2,
  animationRootMargin: '0px 0px -10% 0px',
  // Track if reduced motion is preferred
  prefersReducedMotion: false,
  // Performance flags
  lowPerformanceMode: false,
  fps: 60
};

/**
 * Check if reduced motion is preferred
 * @returns {boolean} Whether reduced motion is preferred
 */
function checkReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Update reduced motion setting
 */
function updateReducedMotionPreference() {
  animationState.prefersReducedMotion = checkReducedMotion();
  
  // Apply appropriate CSS class to body
  if (animationState.prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
}

/**
 * Calculate frames per second
 * @param {number} now Current timestamp
 */
function calculateFPS(now) {
  if (animationState.lastFrameTime === 0) {
    animationState.lastFrameTime = now;
    return;
  }
  
  const delta = now - animationState.lastFrameTime;
  animationState.lastFrameTime = now;
  
  // Store frame times for the last 60 frames
  animationState.frameTimes.push(delta);
  if (animationState.frameTimes.length > 60) {
    animationState.frameTimes.shift();
  }
  
  // Calculate average FPS
  if (animationState.frameTimes.length > 10) {
    const averageDelta = animationState.frameTimes.reduce((acc, val) => acc + val, 0) / animationState.frameTimes.length;
    animationState.fps = Math.round(1000 / averageDelta);
    
    // Enable low performance mode if FPS drops below 30
    animationState.lowPerformanceMode = animationState.fps < 30;
  }
}

/**
 * Animation frame callback for performance monitoring
 * @param {number} now Current timestamp
 */
function animationFrameCallback(now) {
  calculateFPS(now);
  
  // Continue monitoring if we have active animations
  if (animationState.activeAnimations.size > 0) {
    requestAnimationFrame(animationFrameCallback);
  } else {
    animationState.lastFrameTime = 0;
    animationState.frameTimes = [];
  }
}

/**
 * Initialize scroll-based animations using IntersectionObserver
 */
export function initScrollAnimations() {
  // If reduced motion is preferred, don't set up scroll animations
  if (animationState.prefersReducedMotion) {
    // Make all elements visible without animation
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('animated');
    });
    return;
  }
  
  // Create IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        // Only animate elements that are intersecting
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Add to active animations
          animationState.activeAnimations.add(element);
          
          // Start performance monitoring if this is the first animation
          if (animationState.activeAnimations.size === 1) {
            requestAnimationFrame(animationFrameCallback);
          }
          
          // Apply animation class with delay if specified
          const delay = element.getAttribute('data-animation-delay') || 0;
          setTimeout(() => {
            element.classList.add('animated');
            
            // Remove from active animations after animation completes
            const duration = parseFloat(getComputedStyle(element).transitionDuration) * 1000 || 500;
            setTimeout(() => {
              animationState.activeAnimations.delete(element);
            }, duration + 100);
            
            // Stop observing this element
            observer.unobserve(element);
          }, delay);
        }
      });
    },
    {
      threshold: animationState.animationThreshold,
      rootMargin: animationState.animationRootMargin
    }
  );
  
  // Observe all elements with animate-on-scroll class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Create placeholder animations for content loading
 */
export function createPlaceholderAnimations() {
  // Skip complex animations in reduced motion mode
  if (animationState.prefersReducedMotion) {
    return;
  }
  
  const placeholderIcons = document.querySelectorAll('.placeholder-icon');
  const placeholderLines = document.querySelectorAll('.placeholder-line');
  
  // Don't animate if we're in low performance mode
  if (animationState.lowPerformanceMode) {
    return;
  }
  
  // Add subtle animation to icons
  placeholderIcons.forEach(icon => {
    // Add a small pulse animation
    icon.style.animation = 'pulse 2s infinite ease-in-out';
  });
  
  // Add CSS for the pulse animation if it doesn't exist
  if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      /* Disable animations when reduced motion is preferred */
      @media (prefers-reduced-motion: reduce) {
        .placeholder-icon, .placeholder-line, .animate-on-scroll {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add shine effect to placeholder lines (staggered)
  placeholderLines.forEach((line, index) => {
    // Don't animate if we're in low performance mode
    if (animationState.lowPerformanceMode && index > 2) {
      return; // Only animate first few lines in low performance mode
    }
    
    // Add a shine animation with staggered delay
    line.style.position = 'relative';
    line.style.overflow = 'hidden';
    
    // Create shine element if it doesn't exist
    if (!line.querySelector('.shine-effect')) {
      const shine = document.createElement('div');
      shine.className = 'shine-effect';
      shine.style.position = 'absolute';
      shine.style.top = '0';
      shine.style.left = '-100%';
      shine.style.width = '50%';
      shine.style.height = '100%';
      shine.style.background = 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)';
      shine.style.transform = 'skewX(-25deg)';
      shine.style.animation = `shine 3s ${index * 0.5}s infinite`;
      
      line.appendChild(shine);
    }
  });
  
  // Add CSS for the shine animation if it doesn't exist
  if (!document.getElementById('shine-animation')) {
    const style = document.createElement('style');
    style.id = 'shine-animation';
    style.textContent = `
      @keyframes shine {
        0% { left: -100%; }
        20% { left: 100%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Create loading animations for UI elements
 * @param {string} selector CSS selector for elements to animate
 * @param {string} type Type of loading animation (pulse, spinner, or skeleton)
 */
export function createLoadingAnimation(selector, type = 'spinner') {
  const elements = document.querySelectorAll(selector);
  
  if (elements.length === 0) return;
  
  // Add appropriate loading animation based on type
  elements.forEach(element => {
    element.classList.add('loading');
    
    switch (type) {
      case 'pulse':
        element.classList.add('loading-pulse');
        break;
      case 'skeleton':
        element.classList.add('loading-skeleton');
        break;
      case 'spinner':
      default:
        // Create spinner element
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-label', 'Loading');
        
        // Append spinner to element
        element.appendChild(spinner);
        break;
    }
  });
  
  // Add loading animation styles if they don't exist
  if (!document.getElementById('loading-animations')) {
    const style = document.createElement('style');
    style.id = 'loading-animations';
    style.textContent = `
      .loading {
        position: relative;
        min-height: 50px;
      }
      
      .loading-pulse {
        animation: loading-pulse 1.5s ease-in-out infinite;
      }
      
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading-skeleton 1.5s ease-in-out infinite;
      }
      
      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: loading-spinner 1s linear infinite;
      }
      
      @keyframes loading-pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
      
      @keyframes loading-spinner {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      @keyframes loading-skeleton {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Return function to remove loading animation
  return function removeLoading() {
    elements.forEach(element => {
      element.classList.remove('loading', 'loading-pulse', 'loading-skeleton');
      
      // Remove spinner if it exists
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
    });
  };
}

/**
 * Initialize smooth transitions for page navigation
 */
export function initSmoothTransitions() {
  // Skip if reduced motion is preferred
  if (animationState.prefersReducedMotion) {
    return;
  }
  
  // Add page transition styles
  if (!document.getElementById('page-transitions')) {
    const style = document.createElement('style');
    style.id = 'page-transitions';
    style.textContent = `
      .page-transition {
        animation: page-in 0.5s ease-out forwards;
      }
      
      @keyframes page-in {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .page-transition {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add page transition class to main content
  const mainContent = document.querySelector('main');
  if (mainContent && !mainContent.classList.contains('page-transition')) {
    mainContent.classList.add('page-transition');
  }
  
  // Handle link clicks for internal navigation
  document.querySelectorAll('a[href^="/"]:not([target]), a[href^="./"]:not([target]), a[href^="../"]:not([target])').forEach(link => {
    link.addEventListener('click', function(event) {
      // Only handle internal links
      const href = this.getAttribute('href');
      const isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
      
      if (isInternal && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        
        // Create exit animation
        mainContent.style.animation = 'page-out 0.3s ease-in forwards';
        
        // Navigate after animation completes
        setTimeout(() => {
          window.location.href = href;
        }, 300);
        
        // Create keyframe for exit animation
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
          @keyframes page-out {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `;
        document.head.appendChild(exitStyle);
      }
    });
  });
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  // Start monitoring FPS
  requestAnimationFrame(animationFrameCallback);
  
  // Add FPS counter to page (development only)
  if (process.env.NODE_ENV === 'development') {
    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fps-counter';
    fpsCounter.style.position = 'fixed';
    fpsCounter.style.bottom = '10px';
    fpsCounter.style.right = '10px';
    fpsCounter.style.background = 'rgba(0, 0, 0, 0.7)';
    fpsCounter.style.color = 'white';
    fpsCounter.style.padding = '5px 10px';
    fpsCounter.style.borderRadius = '3px';
    fpsCounter.style.fontSize = '12px';
    fpsCounter.style.zIndex = '9999';
    document.body.appendChild(fpsCounter);
    
    // Update FPS counter
    const updateFPSCounter = () => {
      fpsCounter.textContent = `FPS: ${animationState.fps}`;
      fpsCounter.style.color = animationState.fps < 30 ? 'red' : 'white';
      requestAnimationFrame(updateFPSCounter);
    };
    
    requestAnimationFrame(updateFPSCounter);
  }
  
  // Listen for visibility change to pause animations when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Pause animations
      document.body.classList.add('animations-paused');
    } else {
      // Resume animations
      document.body.classList.remove('animations-paused');
    }
  });
  
  // Add global pause style
  if (!document.getElementById('animations-paused')) {
    const style = document.createElement('style');
    style.id = 'animations-paused';
    style.textContent = `
      .animations-paused * {
        animation-play-state: paused !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Throttled scroll handler for performance-sensitive scroll animations
 */
const handleScroll = throttle(() => {
  // Get scroll position
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Apply parallax effect to elements with parallax class
  if (!animationState.prefersReducedMotion && !animationState.lowPerformanceMode) {
    document.querySelectorAll('.parallax').forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax-speed') || 0.5);
      element.style.transform = `translateY(${scrollTop * speed}px)`;
    });
  }
}, 16); // ~60fps

/**
 * Initialize all animation features
 */
export function initAnimations() {
  // Check for reduced motion preference
  updateReducedMotionPreference();
  
  // Listen for changes to reduced motion preference
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', updateReducedMotionPreference);
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Create placeholder animations
  createPlaceholderAnimations();
  
  // Initialize smooth transitions
  initSmoothTransitions();
  
  // Initialize performance monitoring
  initPerformanceMonitoring();
  
  // Add scroll event listener for performance-sensitive scroll animations
  window.addEventListener('scroll', handleScroll, { passive: true });
}

export default {
  initAnimations,
  initScrollAnimations,
  createPlaceholderAnimations,
  createLoadingAnimation,
  initSmoothTransitions,
  initPerformanceMonitoring
};

