/**
 * Utilities Module
 * Provides common utility functions including:
 * - Throttle and debounce
 * - DOM helpers
 * - UUID generation
 * - Environment configuration
 * - Feature detection
 * - Error handling
 * - Date/time formatting
 * - Validation helpers
 */

/**
 * Throttle function
 * Limits the execution of a function to once every specified time interval
 * @param {Function} func Function to throttle
 * @param {number} wait Time interval in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, wait) {
  let timeout = null;
  let lastExecution = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastExecution >= wait) {
      lastExecution = now;
      func.apply(this, args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastExecution = Date.now();
        func.apply(this, args);
      }, wait - (now - lastExecution));
    }
  };
}

/**
 * Debounce function
 * Ensures a function is only called once after a specified delay time
 * @param {Function} func Function to debounce
 * @param {number} delay Delay time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeout;
  
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Generate a UUID v4
 * @returns {string} Generated UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Environment Configuration
 */
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',

  get current() {
    return process.env.NODE_ENV || ENV.DEVELOPMENT;
  }
};

/**
 * Feature detection utility
 * @param {string} feature Feature to check for
 * @returns {boolean} Whether the feature is supported
 */
export function isFeatureSupported(feature) {
  switch (feature) {
    case 'IntersectionObserver':
      return 'IntersectionObserver' in window;
    case 'localStorage':
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Error handling utility
 * Logs an error to the console and optionally shows an alert
 * @param {Error|string} error Error to handle
 * @param {boolean} showAlert Whether to show an alert with the error message
 */
export function handleError(error, showAlert = false) {
  console.error('Error:', error);
  if (showAlert) {
    alert('An error occurred:\n' + (error.message || error));
  }
}

/**
 * Format a date
 * Converts a Date object to a string in the format 'DD/MM/YYYY'
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Validate email
 * Checks whether a string is a valid email format
 * @param {string} email Email address to validate
 * @returns {boolean} Whether the email is valid
 */
export function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate phone number
 * Simple validation for phone numbers (international support)
 * @param {string} phone Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export function isValidPhone(phone) {
  const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phonePattern.test(phone);
}

/**
 * Validate URL
 * Checks whether a string is a valid URL format
 * @param {string} url URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * DOM Manipulation Helper
 * Add event listener to multiple elements
 * @param {NodeList} elements DOM elements to attach listeners to
 * @param {string} event Event type
 * @param {Function} handler Event handler function
 */
export function addEventListeners(elements, event, handler) {
  elements.forEach(element => {
    element.addEventListener(event, handler);
  });
}

export default {
  throttle,
  debounce,
  generateUUID,
  ENV,
  isFeatureSupported,
  handleError,
  formatDate,
  isValidEmail,
  isValidPhone,
  isValidURL,
  addEventListeners
};

