// Main JavaScript file for Royal Eleganto website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Royal Eleganto website loaded');
    
    // Initialize all interactive elements
    initializeNavigation();
    initializeMobileMenu();
    initializeScrollEvents();
    initializeGallery();
    initializeContactForm();
    createPlaceholderImages();
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

// Function to handle gallery functionality
function initializeGallery() {
    // Gallery filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
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

// Function to create placeholder images until real images are added
function createPlaceholderImages() {
    const placeholderImages = document.querySelectorAll('.placeholder-img');
    
    placeholderImages.forEach(img => {
        // Store original src if it exists
        const originalSrc = img.getAttribute('src');
        
        // If it's a real image path (not just a placeholder path), skip it
        if (originalSrc && !originalSrc.includes('placeholder')) {
            return;
        }
        
        // Get parent element dimensions
        const parent = img.parentElement;
        const width = parent.offsetWidth || 300;
        const height = parent.offsetHeight || 200;
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Set background color
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Draw a placeholder pattern
        ctx.fillStyle = '#ddd';
        for (let i = 0; i < width; i += 20) {
            for (let j = 0; j < height; j += 20) {
                if ((i + j) % 40 === 0) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        }
        
        // Add text if it's in the gallery
        if (img.closest('.gallery-item')) {
            const text = img.getAttribute('alt') || 'Image';
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText(text, width / 2, height / 2);
        }
        
        // Set the canvas as the image source
        img.src = canvas.toDataURL('image/png');
    });
}

