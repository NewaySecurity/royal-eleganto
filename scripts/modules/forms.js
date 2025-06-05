/**
 * Forms Module
 * Handles all form-related functionality including:
 * - Form validation
 * - Form data persistence
 * - CSRF protection
 * - Rate limiting
 * - Loading states
 * - WhatsApp integration
 * - Newsletter form handling
 */

import { debounce, generateUUID } from './utils.js';

// Configuration - These would normally be loaded from environment variables
// For demonstration, they're defined here but should be moved to environment config
const CONFIG = {
  WHATSAPP_NUMBER: '27674939784', // This should be an environment variable in production
  MAX_SUBMISSIONS_PER_HOUR: 5,
  FORM_DATA_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
};

/**
 * Generate a CSRF token and store it in localStorage
 * @returns {string} The generated CSRF token
 */
export function generateCSRFToken() {
  const token = generateUUID();
  const expiry = Date.now() + CONFIG.TOKEN_EXPIRY;
  
  localStorage.setItem('csrf_token', token);
  localStorage.setItem('csrf_token_expiry', expiry.toString());
  
  return token;
}

/**
 * Validate a CSRF token against the stored one
 * @param {string} token The token to validate
 * @returns {boolean} Whether the token is valid
 */
export function validateCSRFToken(token) {
  const storedToken = localStorage.getItem('csrf_token');
  const tokenExpiry = parseInt(localStorage.getItem('csrf_token_expiry') || '0');
  
  // Check if token exists, matches, and hasn't expired
  if (!storedToken || storedToken !== token) {
    return false;
  }
  
  if (Date.now() > tokenExpiry) {
    // Token expired, generate a new one
    generateCSRFToken();
    return false;
  }
  
  return true;
}

/**
 * Check if the user has exceeded the rate limit for submissions
 * @returns {boolean} Whether the user has exceeded the rate limit
 */
export function checkRateLimit() {
  const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
  const now = Date.now();
  
  // Filter submissions from the last hour
  const recentSubmissions = submissions.filter(
    timestamp => now - timestamp < 60 * 60 * 1000
  );
  
  // Store the updated list back in localStorage
  localStorage.setItem('form_submissions', JSON.stringify(recentSubmissions));
  
  // Check if the user has exceeded the maximum submissions per hour
  return recentSubmissions.length >= CONFIG.MAX_SUBMISSIONS_PER_HOUR;
}

/**
 * Record a form submission for rate limiting purposes
 */
export function recordSubmission() {
  const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
  submissions.push(Date.now());
  localStorage.setItem('form_submissions', JSON.stringify(submissions));
}

/**
 * Save form data to localStorage for persistence
 * @param {string} formId The ID of the form
 * @param {Object} data The form data to save
 */
export function saveFormData(formId, data) {
  const formData = {
    timestamp: Date.now(),
    data: data
  };
  
  localStorage.setItem(`form_data_${formId}`, JSON.stringify(formData));
}

/**
 * Load saved form data from localStorage
 * @param {string} formId The ID of the form
 * @returns {Object|null} The loaded form data or null if not found or expired
 */
export function loadFormData(formId) {
  const savedData = localStorage.getItem(`form_data_${formId}`);
  
  if (!savedData) {
    return null;
  }
  
  const formData = JSON.parse(savedData);
  const now = Date.now();
  
  // Check if the data has expired
  if (now - formData.timestamp > CONFIG.FORM_DATA_EXPIRY) {
    localStorage.removeItem(`form_data_${formId}`);
    return null;
  }
  
  return formData.data;
}

/**
 * Clear saved form data from localStorage
 * @param {string} formId The ID of the form
 */
export function clearFormData(formId) {
  localStorage.removeItem(`form_data_${formId}`);
}

/**
 * Show an error message for a form field
 * @param {HTMLElement} input The input element
 * @param {string} message The error message
 */
export function showError(input, message) {
  // Find error message element
  let errorMessage = input.nextElementSibling;
  
  // If there's no next sibling or it's not an error message element, find by related ID
  if (!errorMessage || !errorMessage.classList.contains('error-message')) {
    const inputId = input.id;
    errorMessage = document.getElementById(`${inputId}-error`);
  }
  
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Add error class to input
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    
    // Set the error message as an aria-describedby for the input
    input.setAttribute('aria-describedby', errorMessage.id);
  }
  
  // Highlight the input
  input.style.borderColor = 'var(--color-error)';
  
  // Focus the first input with an error
  if (document.querySelector('.error') === input) {
    input.focus();
  }
}

/**
 * Clear error message for a form field
 * @param {HTMLElement} input The input element
 */
export function clearError(input) {
  // Find error message element
  let errorMessage = input.nextElementSibling;
  
  // If there's no next sibling or it's not an error message element, find by related ID
  if (!errorMessage || !errorMessage.classList.contains('error-message')) {
    const inputId = input.id;
    errorMessage = document.getElementById(`${inputId}-error`);
  }
  
  if (errorMessage) {
    errorMessage.style.display = 'none';
    
    // Remove error class from input
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
  }
  
  // Reset border color
  input.style.borderColor = '';
}

/**
 * Show a loading state on a form
 * @param {HTMLFormElement} form The form element
 */
export function showLoading(form) {
  // Disable all inputs and buttons
  form.querySelectorAll('input, select, textarea, button').forEach(el => {
    el.disabled = true;
  });
  
  // Create loading spinner if it doesn't exist
  let loadingSpinner = form.querySelector('.form-loading');
  
  if (!loadingSpinner) {
    loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'form-loading';
    loadingSpinner.innerHTML = '<div class="spinner"></div><span>Processing...</span>';
    loadingSpinner.setAttribute('role', 'status');
    loadingSpinner.setAttribute('aria-live', 'polite');
    form.appendChild(loadingSpinner);
  }
  
  loadingSpinner.style.display = 'flex';
}

/**
 * Hide the loading state on a form
 * @param {HTMLFormElement} form The form element
 */
export function hideLoading(form) {
  // Re-enable all inputs and buttons
  form.querySelectorAll('input, select, textarea, button').forEach(el => {
    el.disabled = false;
  });
  
  // Hide loading spinner
  const loadingSpinner = form.querySelector('.form-loading');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}

/**
 * Show a success message for a form
 * @param {HTMLFormElement} form The form element
 * @param {string} message The success message
 */
export function showSuccess(form, message = 'Form submitted successfully!') {
  // Find success message element or create one
  let successMessage = form.querySelector('.form-success');
  
  if (!successMessage) {
    successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.setAttribute('role', 'alert');
    successMessage.setAttribute('aria-live', 'assertive');
    form.appendChild(successMessage);
  }
  
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  
  // Hide success message after a delay
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 5000);
}

/**
 * Validate a contact form
 * @param {HTMLFormElement} form The form element
 * @returns {boolean} Whether the form is valid
 */
export function validateContactForm(form) {
  let isValid = true;
  
  // Clear all existing error messages
  form.querySelectorAll('.error-message').forEach(el => {
    el.style.display = 'none';
  });
  
  // Reset all inputs
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.style.borderColor = '';
    el.classList.remove('error');
    el.removeAttribute('aria-invalid');
  });
  
  // Name validation
  const nameInput = form.querySelector('#name');
  if (nameInput) {
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Please enter your name');
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      showError(nameInput, 'Name must be at least 2 characters');
      isValid = false;
    }
  }
  
  // Email validation
  const emailInput = form.querySelector('#email');
  if (emailInput) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      showError(emailInput, 'Please enter your email');
      isValid = false;
    } else if (!emailPattern.test(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address');
      isValid = false;
    }
  }
  
  // Phone validation (if provided)
  const phoneInput = form.querySelector('#phone');
  if (phoneInput && phoneInput.value.trim()) {
    const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phonePattern.test(phoneInput.value)) {
      showError(phoneInput, 'Please enter a valid phone number');
      isValid = false;
    }
  }
  
  // Service/Subject validation
  const serviceInput = form.querySelector('#service, #subject');
  if (serviceInput) {
    if (!serviceInput.value || serviceInput.value === '') {
      showError(serviceInput, 'Please select an option');
      isValid = false;
    }
  }
  
  // Message validation
  const messageInput = form.querySelector('#message');
  if (messageInput) {
    if (!messageInput.value.trim()) {
      showError(messageInput, 'Please enter your message');
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      showError(messageInput, 'Message must be at least 10 characters');
      isValid = false;
    }
  }
  
  // Consent validation
  const consentInput = form.querySelector('#consent');
  if (consentInput && !consentInput.checked) {
    showError(consentInput, 'You must consent to the data collection');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Initialize the contact form with all features
 */
export function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (!contactForm) return;
  
  // Add CSRF token
  const csrfToken = generateCSRFToken();
  let csrfInput = contactForm.querySelector('input[name="csrf_token"]');
  
  if (!csrfInput) {
    csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    contactForm.appendChild(csrfInput);
  }
  
  csrfInput.value = csrfToken;
  
  // Load saved form data
  const savedData = loadFormData('contact-form');
  if (savedData) {
    Object.keys(savedData).forEach(key => {
      const input = contactForm.querySelector(`#${key}`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = savedData[key];
        } else {
          input.value = savedData[key];
        }
      }
    });
    
    // Show notification that form was restored
    const notification = document.createElement('div');
    notification.className = 'form-notification';
    notification.textContent = 'Your previous form data has been restored.';
    notification.style.display = 'block';
    contactForm.prepend(notification);
    
    setTimeout(() => {
      notification.style.display = 'none';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
  
  // Auto-save form data
  const autoSave = debounce(() => {
    const formData = {};
    contactForm.querySelectorAll('input, select, textarea').forEach(input => {
      if (input.id && input.type !== 'hidden' && input.type !== 'submit') {
        if (input.type === 'checkbox') {
          formData[input.id] = input.checked;
        } else {
          formData[input.id] = input.value;
        }
      }
    });
    
    saveFormData('contact-form', formData);
  }, 500);
  
  contactForm.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', autoSave);
    input.addEventListener('change', autoSave);
    
    // Add validation on blur
    input.addEventListener('blur', function() {
      // Skip validation for empty optional fields
      if (this.value.trim() === '' && !this.required) {
        return;
      }
      
      // Perform specific validation based on input type
      if (this.id === 'name' && this.value.trim().length < 2) {
        showError(this, 'Name must be at least 2 characters');
      } else if (this.id === 'email' && this.value.trim() !== '') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(this.value)) {
          showError(this, 'Please enter a valid email address');
        } else {
          clearError(this);
        }
      } else if (this.id === 'phone' && this.value.trim() !== '') {
        const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phonePattern.test(this.value)) {
          showError(this, 'Please enter a valid phone number');
        } else {
          clearError(this);
        }
      } else if (this.id === 'message' && this.value.trim().length < 10) {
        showError(this, 'Message must be at least 10 characters');
      } else {
        clearError(this);
      }
    });
  });
  
  // Form submission
  contactForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validate CSRF token
    const csrfToken = this.querySelector('input[name="csrf_token"]').value;
    if (!validateCSRFToken(csrfToken)) {
      showError(this.querySelector('button[type="submit"]'), 'Security token expired. Please refresh the page.');
      return;
    }
    
    // Check rate limit
    if (checkRateLimit()) {
      showError(this.querySelector('button[type="submit"]'), 'You have submitted too many forms. Please try again later.');
      return;
    }
    
    // Validate form
    if (!validateContactForm(this)) {
      return;
    }
    
    // Show loading state
    showLoading(this);
    
    // Simulate form submission delay
    setTimeout(() => {
      try {
        // Record submission for rate limiting
        recordSubmission();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const serviceEl = document.getElementById('service');
        const service = serviceEl.options[serviceEl.selectedIndex].text;
        const message = document.getElementById('message').value;
        
        // Format message for WhatsApp
        const whatsappMessage = `*New Contact Form Submission*\n\n` +
          `*Name:* ${name}\n` +
          `*Email:* ${email}\n` +
          `*Phone:* ${phone || 'Not provided'}\n` +
          `*Service:* ${service}\n` +
          `*Message:* ${message}`;
        
        // Open WhatsApp with pre-filled message
        window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
        
        // Clear saved form data
        clearFormData('contact-form');
        
        // Show success message
        showSuccess(this, 'Thank you! Your message has been sent via WhatsApp.');
        
        // Reset form
        this.reset();
        
      } catch (error) {
        console.error('Error submitting form:', error);
        showError(this.querySelector('button[type="submit"]'), 'An error occurred. Please try again.');
      } finally {
        // Hide loading state
        hideLoading(this);
      }
    }, 1000);
  });
}

/**
 * Initialize the newsletter form
 */
export function initNewsletterForm() {
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  
  newsletterForms.forEach(form => {
    // Add CSRF token
    const csrfToken = generateCSRFToken();
    let csrfInput = form.querySelector('input[name="csrf_token"]');
    
    if (!csrfInput) {
      csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrf_token';
      form.appendChild(csrfInput);
    }
    
    csrfInput.value = csrfToken;
    
    // Add form submission handling
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get email input
      const emailInput = this.querySelector('input[type="email"]');
      if (!emailInput || !emailInput.value.trim()) {
        // Create error message if it doesn't exist
        let errorMessage = this.querySelector('.error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          this.appendChild(errorMessage);
        }
        
        errorMessage.textContent = 'Please enter your email address';
        errorMessage.style.display = 'block';
        
        emailInput.focus();
        return;
      }
      
      // Validate email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value)) {
        // Create error message if it doesn't exist
        let errorMessage = this.querySelector('.error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          this.appendChild(errorMessage);
        }
        
        errorMessage.textContent = 'Please enter a valid email address';
        errorMessage.style.display = 'block';
        
        emailInput.focus();
        return;
      }
      
      // Check rate limit
      if (checkRateLimit()) {
        // Create error message if it doesn't exist
        let errorMessage = this.querySelector('.error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          this.appendChild(errorMessage);
        }
        
        errorMessage.textContent = 'Too many submissions. Please try again later.';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Show loading state
      const submitButton = this.querySelector('button[type="submit"]');
      const originalContent = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      // Simulate form submission
      setTimeout(() => {
        // Record submission for rate limiting
        recordSubmission();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalContent;
        
        // Show success message
        let successMessage = this.querySelector('.success-message');
        if (!successMessage) {
          successMessage = document.createElement('div');
          successMessage.className = 'success-message';
          form.appendChild(successMessage);
        }
        
        successMessage.textContent = 'Thank you for subscribing!';
        successMessage.style.display = 'block';
        
        // Hide error message if visible
        const errorMessage = this.querySelector('.error-message');
        if (errorMessage) {
          errorMessage.style.display = 'none';
        }
        
        // Reset form
        this.reset();
        
        // Hide success message after delay
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 5000);
      }, 1000);
    });
  });
}

/**
 * Initialize all form functionality
 */
export function initForms() {
  initContactForm();
  initNewsletterForm();
}

export default {
  initForms,
  initContactForm,
  initNewsletterForm,
  validateContactForm,
  saveFormData,
  loadFormData,
  clearFormData,
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  recordSubmission,
  showError,
  clearError,
  showLoading,
  hideLoading,
  showSuccess
};

