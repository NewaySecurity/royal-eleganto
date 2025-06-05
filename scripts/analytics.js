// Google Analytics and Tag Manager Configuration

// Google Tag Manager
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX'); // Replace with your GTM ID

// Google Analytics 4
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 Measurement ID

// ===== Event Tracking =====

// Track form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Contact form tracking
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            gtag('event', 'form_submission', {
                'event_category': 'Contact',
                'event_label': 'Contact Form'
            });
        });
    }
    
    // Newsletter form tracking
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            gtag('event', 'form_submission', {
                'event_category': 'Newsletter',
                'event_label': 'Newsletter Signup'
            });
        });
    });
    
    // Track button clicks
    const buttons = document.querySelectorAll('a.btn-primary, a.btn-secondary, button.filter-btn, button.tab-btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonClass = this.classList.contains('btn-primary') ? 'Primary Button' : 
                               this.classList.contains('btn-secondary') ? 'Secondary Button' : 
                               this.classList.contains('filter-btn') ? 'Filter Button' : 'Tab Button';
            
            gtag('event', 'button_click', {
                'event_category': buttonClass,
                'event_label': buttonText
            });
        });
    });
    
    // Track external link clicks
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.host + '"])');
    externalLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const linkUrl = this.getAttribute('href');
            
            gtag('event', 'external_link', {
                'event_category': 'Outbound Links',
                'event_label': linkUrl
            });
        });
    });
    
    // Track scroll depth
    let scrollMarks = [25, 50, 75, 90];
    let scrollMarksReached = {};
    
    // Initialize scroll marks as not reached
    scrollMarks.forEach(function(mark) {
        scrollMarksReached[mark] = false;
    });
    
    // Track scroll position
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        scrollMarks.forEach(function(mark) {
            if (scrollPercent >= mark && !scrollMarksReached[mark]) {
                gtag('event', 'scroll_depth', {
                    'event_category': 'Page Scroll',
                    'event_label': mark + '%',
                    'non_interaction': true
                });
                
                scrollMarksReached[mark] = true;
            }
        });
    });
    
    // Track page load time
    window.addEventListener('load', function() {
        setTimeout(function() {
            const pageLoadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
            
            gtag('event', 'page_performance', {
                'event_category': 'Performance',
                'event_label': 'Page Load Time',
                'value': pageLoadTime,
                'non_interaction': true
            });
        }, 0);
    });
});

