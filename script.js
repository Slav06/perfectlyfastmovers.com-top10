// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Animated counters
function animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target) + suffix;
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current)) + suffix;
        }
    }, 16);
}

// Initialize counters when page loads
function initCounters() {
    // You can update these numbers based on actual data
    const familiesMoved = 30000;
    const recentBookings = 12;
    
    const familiesElement = document.getElementById('familiesMoved');
    const recentElement = document.getElementById('recentBookings');
    const quoteFamilies = document.getElementById('quoteFamilies');
    const quoteRecent = document.getElementById('quoteRecent');
    const ctaRecent = document.getElementById('ctaRecent');
    
    if (familiesElement) {
        animateCounter(familiesElement, familiesMoved, '+');
    }
    if (recentElement) {
        animateCounter(recentElement, recentBookings, '+');
    }
    if (quoteFamilies) {
        animateCounter(quoteFamilies, familiesMoved, '+');
    }
    if (quoteRecent) {
        animateCounter(quoteRecent, recentBookings, '+');
    }
    if (ctaRecent) {
        animateCounter(ctaRecent, recentBookings, '+');
    }
}

// Initialize counters on page load
window.addEventListener('load', initCounters);

// Update license numbers
function updateLicenseNumbers() {
    const dotNumber = '3516489';
    const mcNumber = '1197300';
    
    document.getElementById('dotNumber').textContent = dotNumber;
    document.getElementById('footerDotNumber').textContent = dotNumber;
    document.getElementById('mcNumber').textContent = mcNumber;
    document.getElementById('footerMcNumber').textContent = mcNumber;
}

// Initialize license numbers on page load
window.addEventListener('load', updateLicenseNumbers);

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Quote form step navigation
let currentStep = 1;
const totalSteps = 3;

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = progress + '%';
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        if (index + 1 <= currentStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(formStep => {
        formStep.classList.remove('active');
    });
    
    const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    updateProgress();
}

function nextStep() {
    const currentFormStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentFormStep.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ef4444';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 2000);
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (isValid && currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// Initialize progress on page load
updateProgress();

// Extract 5-digit zip from address string (e.g. "12345" or "City, ST 12345")
function extractZip(str) {
    if (!str || typeof str !== 'string') return '';
    const match = str.trim().match(/\b(\d{5})(-\d{4})?\b/);
    return match ? match[1] : str.replace(/\D/g, '').slice(0, 5) || '';
}

// Format date as MM/DD/YYYY for Hello Moving API
function formatMoveDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
}

// POST to our API proxy (avoids CORS); proxy forwards to Hello Moving
const LEAD_POST_URL = '/api/lead';

// Capture clickid from URL and store it for form submission
function getClickId() {
    // Check URL parameters for clickid
    const urlParams = new URLSearchParams(window.location.search);
    const clickid = urlParams.get('clickid');
    
    // If found in URL, store it in sessionStorage to persist across navigation
    if (clickid) {
        sessionStorage.setItem('clickid', clickid);
        console.log('[DEBUG] ClickID captured from URL:', clickid);
        return clickid;
    }
    
    // If not in URL, check sessionStorage (in case user navigated from a page with clickid)
    const storedClickId = sessionStorage.getItem('clickid');
    if (storedClickId) {
        console.log('[DEBUG] ClickID retrieved from sessionStorage:', storedClickId);
    } else {
        console.log('[DEBUG] No ClickID found in URL or sessionStorage');
    }
    return storedClickId || null;
}

// Initialize clickid capture on page load
const capturedClickId = getClickId();
if (capturedClickId) {
    console.log('[DEBUG] ClickID initialized on page load:', capturedClickId);
}

// Quote form submission - POST to Hello Moving API
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pickup = document.getElementById('pickup').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const moveDate = document.getElementById('moveDate').value;
        const moveSize = document.getElementById('moveSize').value;
        const firstname = document.getElementById('firstname').value.trim();
        const lastname = document.getElementById('lastname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.replace(/\D/g, '').slice(0, 10);
        const phoneFormatted = phone.length >= 10 ? phone : document.getElementById('phone').value.trim();
        
        const ozip = extractZip(pickup);
        const dzip = extractZip(destination);
        const movedte = formatMoveDate(moveDate);
        
        // Get clickid (from URL or sessionStorage)
        const clickid = getClickId();
        
        // Build POST body per Developer Guide (label, firstname, lastname, email, phone1, movedte, ozip, dzip, movesize)
        const params = new URLSearchParams();
        params.set('label', 'BESTMOVING');
        params.set('firstname', firstname);
        params.set('lastname', lastname);
        params.set('email', email);
        params.set('phone1', phoneFormatted);
        params.set('movedte', movedte);
        params.set('ozip', ozip);
        params.set('dzip', dzip);
        params.set('pickup', pickup);
        params.set('destination', destination);
        params.set('movesize', moveSize);
        params.set('servtypeid', '102'); // 102 = Long Distance Move per Developer Guide
        
        // Add leadno (Granot Developer Guide) + Ref_no (lead provider)
        if (clickid) {
            params.set('leadno', clickid);  // Granot – per Leads Posting Developer Guide
            params.set('Ref_no', clickid);  // Lead provider
            console.log('[DEBUG] leadno + Ref_no added:', clickid);
        } else {
            console.warn('[DEBUG] No ClickID available – leadno/Ref_no not sent');
        }
        
        // Log all parameters being sent (for debugging)
        console.log('[DEBUG] Form submission parameters:', Object.fromEntries(params));
        console.log('[DEBUG] Full POST body:', params.toString());
        
        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            console.log('[DEBUG] Sending POST request to:', LEAD_POST_URL);
            const response = await fetch(LEAD_POST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
            const text = await response.text();
            console.log('[DEBUG] API Response:', text);
            console.log('[DEBUG] Response Status:', response.status);
            
            // API returns delimited string e.g. "104360,0,OK,6,6" (LEADID, ERRID, message, ...)
            const parts = text.split(',');
            const leadId = parts[0] ? parts[0].trim() : '';
            const errId = parts[1] ? parts[1].trim() : '';
            const message = parts[2] ? parts[2].trim() : text;
            
            console.log('[DEBUG] Parsed Response - LeadID:', leadId, 'ErrorID:', errId, 'Message:', message);
            
            if (errId === '0') {
                // Successful lead post – send user to a proper thank-you page
                const recentBookings = parseInt(document.getElementById('recentBookings').textContent) || 12;
                document.getElementById('recentBookings').textContent = (recentBookings + 1) + '+';
                const quoteRecentEl = document.getElementById('quoteRecent');
                if (quoteRecentEl) quoteRecentEl.textContent = (recentBookings + 1) + '+';
                const ctaRecentEl = document.getElementById('ctaRecent');
                if (ctaRecentEl) ctaRecentEl.textContent = (recentBookings + 1) + '+';

                // Redirect to thank-you page (staff can customize content there)
                window.location.href = 'thank-you.html';
            } else {
                alert('There was a problem submitting your request. Please try again or call us at 878-287-2502. Error: ' + message);
            }
        } catch (err) {
            console.error('Lead post error:', err);
            alert('Could not submit form. Please check your connection and try again, or call us at 878-287-2502.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// FAQ accordion functionality
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Contact form submitted:', data);
        
        // Show success message
        alert('Thank you for your message! We will get back to you as soon as possible.');
        
        // Reset form
        contactForm.reset();
    });
}

// Phone number formatting
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });
});

// Set minimum date for move date input to today
const moveDateInput = document.getElementById('moveDate');
if (moveDateInput) {
    const today = new Date().toISOString().split('T')[0];
    moveDateInput.setAttribute('min', today);
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and review cards
document.querySelectorAll('.service-card, .review-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});
