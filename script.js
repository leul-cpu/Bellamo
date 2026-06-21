/* ==========================================================================
   Bellamo Portfolio - Interactive Core Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------------------------------------------
    // 1. DOM Elements
    // ---------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section, header');
    const btnBackToTop = document.getElementById('btn-back-to-top');
    const circleProgress = btnBackToTop ? btnBackToTop.querySelector('.circle-progress') : null;
    const toast = document.getElementById('toast-notification');
    const copyBtns = document.querySelectorAll('.copy-detail-btn');
    const contactForm = document.getElementById('bellamo-contact-form');
    const submitBtn = document.getElementById('submit-button');
    const formFeedback = document.getElementById('form-feedback');
    const currentYearSpan = document.getElementById('current-year');
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');

    // Set copyright year dynamically
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ---------------------------------------------------------
    // 2. Mobile Menu Toggle
    // ---------------------------------------------------------
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isOpened = mobileNav.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpened);
            document.body.classList.toggle('no-scroll', isOpened);

            if (isOpened) {
                // Change hamburger icon to X (Close)
                hamburgerIcon.className = 'ph ph-x';
            } else {
                // Change hamburger icon back to List (Open)
                hamburgerIcon.className = 'ph ph-list';
            }
        });

        // Close mobile nav when link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', false);
                document.body.classList.remove('no-scroll');
                hamburgerIcon.className = 'ph ph-list';
            });
        });
    }

    // ---------------------------------------------------------
    // 3. Scroll Events: Sticky Nav & Back to Top Progress
    // ---------------------------------------------------------
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Sticky Navbar
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to Top Visibility
        if (scrollY > 300) {
            btnBackToTop.classList.add('active');
        } else {
            btnBackToTop.classList.remove('active');
        }

        // Scroll Progress Ring Calculation
        if (circleProgress && pageHeight > 0) {
            const progress = (scrollY / pageHeight) * 100;
            // stroke-dashoffset runs from 100 (empty) to 0 (full)
            circleProgress.style.strokeDashoffset = 100 - progress;
        }

        // Active Navigation Link Highlighting
        let currentActiveSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset adjustment
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentActiveSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run immediately in case user reloads page mid-scroll

    // Scroll to Top on CTA press
    if (btnBackToTop) {
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------------------------------------------------------
    // 4. Click-to-Copy Functionality
    // ---------------------------------------------------------
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`Copied "${textToCopy}" to clipboard!`);
                
                // Add micro-animation bounce to button
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'ph ph-check';
                    icon.style.color = '#2e7d32';
                    setTimeout(() => {
                        icon.className = 'ph ph-copy';
                        icon.style.color = '';
                    }, 2000);
                }
            }).catch(err => {
                showToast('Unable to copy. Please copy manually.');
                console.error('Clipboard copy error:', err);
            });
        });
    });

    const showToast = (message, type = '') => {
        if (!toast) return;
        toast.textContent = message;

        // Reset classes and add the correct type
        toast.className = 'toast-box';
        if (type) toast.classList.add(type);

        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 3500);
    };

    // ---------------------------------------------------------
    // 5. Scroll-Triggered Animations (Intersection Observer)
    // ---------------------------------------------------------
    const animationElements = document.querySelectorAll('.fade-up-element');

    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Animates once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px' // Trigger slightly before element enters
        });

        animationElements.forEach(el => animationObserver.observe(el));
    } else {
        // Fallback for older browsers
        animationElements.forEach(el => el.classList.add('animated'));
    }

    // ---------------------------------------------------------
    // 6. Interactive Contact Form Handler (EmailJS Integration)
    // ---------------------------------------------------------
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Set loading state
            submitBtn.disabled = true;
            const originalButtonContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `Sending Message <i class="ph ph-circle-notch spinner-anim" style="display:inline-block; animation:spin 1s linear infinite;" aria-hidden="true"></i>`;

            // Simple CSS animation injection for spinner
            if (!document.getElementById('spinner-style-injection')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'spinner-style-injection';
                styleSheet.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(styleSheet);
            }

            // EmailJS credentials
            const serviceID = 'service_i78f1sw';
            const templateID = 'template_ch3r3vj';

            // Send form using EmailJS
            emailjs.sendForm(serviceID, templateID, contactForm)
                .then(() => {
                    // Reset form inputs
                    contactForm.reset();

                    // Show success feedback via Toast Notification
                    showToast("Message sent successfully! We will contact you shortly.", "success");

                    // Also show a subtle inline message
                    formFeedback.textContent = "Thank you! Your message has been received.";
                    formFeedback.className = "form-feedback-message success";

                    // Restore button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalButtonContent;

                    // Clear inline success message after 6 seconds
                    setTimeout(() => {
                        formFeedback.textContent = "";
                        formFeedback.className = "form-feedback-message";
                    }, 6000);

                }, (err) => {
                    // Restore button state
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalButtonContent;

                    // Show error feedback
                    showToast("Failed to send message. Please try again.", "error");
                    formFeedback.textContent = "Error sending message. Please try again.";
                    formFeedback.className = "form-feedback-message error";
                    console.error('EmailJS Error:', err);
                });
        });
    }

    // ---------------------------------------------------------
    // 7. Visual Theme Toggle (Night Mode)
    // ---------------------------------------------------------
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle icons
        const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
        if (themeToggle) {
            const toggleIcon = themeToggle.querySelector('i');
            if (toggleIcon) toggleIcon.className = iconClass;
        }
        if (themeToggleMobile) {
            const toggleMobileIcon = themeToggleMobile.querySelector('i');
            if (toggleMobileIcon) toggleMobileIcon.className = iconClass;
        }
    };

    // Read stored theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Click Handlers
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

});
