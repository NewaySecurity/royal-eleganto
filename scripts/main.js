// Main JavaScript file for Royal Eleganto website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Royal Eleganto website loaded');
    
    // Initialize all interactive elements
    initializeNavigation();
    initializeMobileMenu();
    initializeScrollEvents();
    initializePricing();
    initializeGallery();
    initializeContactForm();
    createPlaceholderAnimations();
});

// Function to handle navigation behavior and smooth scrolling
function initializeNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Close mobile menu if open
                document.querySelector('nav').classList.remove('active');
                document.querySelector('.mobile-menu-toggle').classList.remove('active');
                
                // Scroll to the section smoothly
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Function to handle mobile menu toggle
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && !event.target.closest('.mobile-menu-toggle') && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// Function to handle scroll events
function initializeScrollEvents() {
    const header = document.querySelector('header');
    const backToTop = document.querySelector('.back-to-top');
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Back to top button visibility
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        
        // Active navigation based on scroll position
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight - 100;
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
    
    // Back to top button click event
    if (backToTop) {
        backToTop.addEventListener('click', function(event) {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Function to handle pricing section filtering
function initializePricing() {
    const pricingFilterButtons = document.querySelectorAll('.pricing-filter .filter-btn');
    const pricingItems = document.querySelectorAll('.pricing-item');
    
    pricingFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            pricingFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter pricing items
            pricingItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Function to handle gallery functionality
function initializeGallery() {
    // Gallery filtering
    const filterButtons = document.querySelectorAll('.gallery-filter .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Gallery modal
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const galleryZoomButtons = document.querySelectorAll('.gallery-zoom');
    
    galleryZoomButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Get image source and information
            const galleryItem = this.closest('.gallery-item');
            const img = galleryItem.querySelector('img');
            const heading = galleryItem.querySelector('h3').textContent;
            const description = galleryItem.querySelector('p').textContent;
            
            // Set modal content
            modalImg.src = img.src;
            modalCaption.innerHTML = `<h3>${heading}</h3><p>${description}</p>`;
            
            // Show modal
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 50);
        });
    });
    
    // Close modal
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Function to handle contact form validation
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Reset form status
            document.getElementById('form-success').style.display = 'none';
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(message => {
                message.style.display = 'none';
            });
            
            // Validate form
            let isValid = true;
            
            // Name validation
            const nameInput = document.getElementById('name');
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            } else if (nameInput.value.trim().length < 2) {
                showError(nameInput, 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Email validation
            const emailInput = document.getElementById('email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!emailPattern.test(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Phone validation (if provided)
            const phoneInput = document.getElementById('phone');
            if (phoneInput.value.trim()) {
                const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
                if (!phonePattern.test(phoneInput.value)) {
                    showError(phoneInput, 'Please enter a valid phone number');
                    isValid = false;
                }
            }
            
            // Subject validation
            const subjectInput = document.getElementById('subject');
            if (!subjectInput.value || subjectInput.value === '') {
                showError(subjectInput, 'Please select a subject');
                isValid = false;
            }
            
            // Message validation
            const messageInput = document.getElementById('message');
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                showError(messageInput, 'Message must be at least 10 characters');
                isValid = false;
            }
            
            // Consent validation
            const consentInput = document.getElementById('consent');
            if (!consentInput.checked) {
                showError(consentInput, 'You must consent to the data collection');
                isValid = false;
            }
            
            // If valid, process the form
            if (isValid) {
                // For demo purposes, we'll just show success message
                // In a real application, you would send the form data to a server here
                document.getElementById('form-success').style.display = 'block';
                contactForm.reset();
                
                // Scroll to success message
                document.getElementById('form-success').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
        
        // Function to show error message
        function showError(input, message) {
            const errorMessage = input.nextElementSibling;
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Highlight the input
            input.style.borderColor = 'var(--color-error)';
            
            // Remove error styling on input
            input.addEventListener('input', function() {
                this.style.borderColor = '';
                errorMessage.style.display = 'none';
            });
        }
    }
}

// Function to add random subtle animations to placeholder elements
function createPlaceholderAnimations() {
    const placeholderIcons = document.querySelectorAll('.placeholder-icon');
    
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
        `;
        document.head.appendChild(style);
    }
    
    // Add shine effect to placeholder lines
    const placeholderLines = document.querySelectorAll('.placeholder-line');
    placeholderLines.forEach((line, index) => {
        // Add a shine animation with staggered delay
        line.style.position = 'relative';
        line.style.overflow = 'hidden';
        
        // Create shine element
        const shine = document.createElement('div');
        shine.style.position = 'absolute';
        shine.style.top = '0';
        shine.style.left = '-100%';
        shine.style.width = '50%';
        shine.style.height = '100%';
        shine.style.background = 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)';
        shine.style.transform = 'skewX(-25deg)';
        shine.style.animation = `shine 3s ${index * 0.5}s infinite`;
        
        line.appendChild(shine);
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

