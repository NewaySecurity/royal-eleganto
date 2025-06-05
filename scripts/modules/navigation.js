/**
 * Navigation Module
 * Handles all navigation-related functionality including:
 * - Header scroll effects
 * - Mobile menu functionality
 * - Smooth scrolling
 * - Back to top button
 */

/**
 * Initialize the header scroll effect
 * Adds 'scrolled' class to header when scrolling down
 */
export function initHeaderScroll() {
  const header = document.querySelector('header');
  
  if (!header) return;
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  // Initial check
  handleScroll();
}

/**
 * Initialize the mobile menu functionality
 */
export function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  
  if (!menuToggle || !nav) return;
  
  // Toggle menu when button is clicked
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('nav') && 
        !event.target.closest('.mobile-menu-toggle') && 
        nav.classList.contains('active')) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
  
  // Close menu when ESC key is pressed
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('active')) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
export function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      // Only handle links that point to an ID on the page
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      event.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Close mobile menu if open
      const nav = document.querySelector('nav');
      const menuToggle = document.querySelector('.mobile-menu-toggle');
      if (nav && menuToggle) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
      
      // Scroll to the section smoothly
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Initialize the back to top button
 */
export function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  
  if (!backToTopBtn) return;
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
  
  // Smooth scroll to top when clicked
  backToTopBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Add keyboard accessibility
  backToTopBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
}

/**
 * Update active navigation based on scroll position
 */
export function initScrollSpy() {
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  window.addEventListener('scroll', () => {
    let current = '';
    const headerHeight = header?.offsetHeight || 0;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Initialize all navigation features
 */
export function initNavigation() {
  initHeaderScroll();
  initMobileMenu();
  initSmoothScrolling();
  initBackToTop();
  initScrollSpy();
}

export default {
  initNavigation,
  initHeaderScroll,
  initMobileMenu,
  initSmoothScrolling,
  initBackToTop,
  initScrollSpy
};

