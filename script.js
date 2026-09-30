/* ==========================================================================
   BellaMo Portfolio - High-Performance Interactive Core Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 2. DOM Elements & References
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
    const portfolioGrid = document.getElementById('portfolio-grid');
    const tickerTrack = document.querySelector('.tools-ticker-track');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ---------------------------------------------------------
    // 3. Mobile Navigation Menu Toggle
    // ---------------------------------------------------------
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpened = mobileNav.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpened);
            if (hamburgerIcon) {
                hamburgerIcon.className = isOpened ? 'ph ph-x' : 'ph ph-list';
            }
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                mobileNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                if (hamburgerIcon) hamburgerIcon.className = 'ph ph-list';

                if (targetId && targetId.startsWith('#')) {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
                mobileNav.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                if (hamburgerIcon) hamburgerIcon.className = 'ph ph-list';
            }
        });
    }

    // ---------------------------------------------------------
    // 4. Throttled Scroll Handling (Sticky Nav, Ring, Active Link)
    // ---------------------------------------------------------
    let isScrolling = false;

    const onScroll = () => {
        const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        if (btnBackToTop) {
            if (scrollY > 300) {
                btnBackToTop.classList.add('active');
            } else {
                btnBackToTop.classList.remove('active');
            }
        }

        if (circleProgress && pageHeight > 0) {
            const progress = (scrollY / pageHeight) * 100;
            circleProgress.style.strokeDashoffset = 100 - progress;
        }

        let currentActiveSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
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

        isScrolling = false;
    };

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(onScroll);
            isScrolling = true;
        }
    }, { passive: true });

    onScroll();

    if (btnBackToTop) {
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------
    // 5. Click-to-Copy Toast Notification
    // ---------------------------------------------------------
    const showToast = (message, type = '') => {
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast-box';
        if (type) toast.classList.add(type);
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 3000);
    };

    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`Copied "${textToCopy}" to clipboard!`);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'ph ph-check';
                    icon.style.color = '#2e7d32';
                    setTimeout(() => {
                        icon.className = 'ph ph-copy';
                        icon.style.color = '';
                    }, 2000);
                }
            }).catch(() => {
                showToast('Unable to copy. Please copy manually.');
            });
        });
    });

    // ---------------------------------------------------------
    // 6. Scroll Animations (IntersectionObserver)
    // ---------------------------------------------------------
    const animationElements = document.querySelectorAll('.fade-up-element');

    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        animationElements.forEach(el => animationObserver.observe(el));
    } else {
        animationElements.forEach(el => el.classList.add('animated'));
    }

    // ---------------------------------------------------------
    // 7. Video Vault Click-to-Load Facades (No initial data transfer)
    // ---------------------------------------------------------
    const initVideoFacade = (btn) => {
        const wrapper = btn.closest('.vault-video-wrapper');
        if (!wrapper) return;
        const videoSrc = wrapper.getAttribute('data-video-src');
        if (!videoSrc) return;

        wrapper.innerHTML = `
            <video class="main-video" controls autoplay playsinline preload="metadata" controlsList="nodownload">
                <source src="${videoSrc}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;

        const video = wrapper.querySelector('video');
        if (video) {
            video.load();
            video.play().catch(() => {
                // If autoplay is blocked by browser policy, user can hit play on native controls
            });
        }
    };

    document.querySelectorAll('.video-facade-btn').forEach(btn => {
        btn.addEventListener('click', () => initVideoFacade(btn));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                initVideoFacade(btn);
            }
        });
    });

    // ---------------------------------------------------------
    // 8. Portfolio Delegated Event Listener (Cards & Caption Toggles)
    // ---------------------------------------------------------
    if (portfolioGrid) {
        portfolioGrid.addEventListener('click', (e) => {
            // Handle "more / less" caption toggle
            const toggleBtn = e.target.closest('.caption-toggle-btn');
            if (toggleBtn) {
                const cardContent = toggleBtn.closest('.card-content');
                if (cardContent) {
                    const isExpanded = cardContent.classList.toggle('expanded');
                    toggleBtn.setAttribute('aria-expanded', isExpanded);
                    toggleBtn.textContent = isExpanded ? 'show less' : 'more';
                }
                return;
            }

            // Handle clicking thumbnail media to open TikTok
            const media = e.target.closest('.card-media');
            if (media) {
                const card = media.closest('.portfolio-card');
                if (card) {
                    const watchLink = card.querySelector('.watch-link');
                    if (watchLink && watchLink.href) {
                        window.open(watchLink.href, '_blank', 'noopener,noreferrer');
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 9. Marquee Ticker Optimization (Pause when off-screen)
    // ---------------------------------------------------------
    if (tickerTrack && 'IntersectionObserver' in window) {
        const tickerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tickerTrack.style.animationPlayState = 'running';
                } else {
                    tickerTrack.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.05 });
        tickerObserver.observe(tickerTrack);
    }

    // ---------------------------------------------------------
    // 10. Lazy Load EmailJS on Form Interaction
    // ---------------------------------------------------------
    let emailJsPromise = null;

    const loadEmailJs = () => {
        if (!emailJsPromise) {
            emailJsPromise = new Promise((resolve, reject) => {
                if (window.emailjs) {
                    resolve(window.emailjs);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
                script.defer = true;
                script.onload = () => {
                    if (window.emailjs) {
                        window.emailjs.init("908ARPC--bLL0_hxk");
                        resolve(window.emailjs);
                    } else {
                        reject(new Error("EmailJS not loaded"));
                    }
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return emailJsPromise;
    };

    if (contactForm) {
        // Preload EmailJS as soon as user focuses any input in the form
        contactForm.addEventListener('focusin', () => loadEmailJs(), { once: true });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            submitBtn.disabled = true;
            const originalButtonContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `Sending Message <i class="ph ph-circle-notch spinner-anim" style="display:inline-block; animation:spin 1s linear infinite;" aria-hidden="true"></i>`;

            try {
                const emailjsInstance = await loadEmailJs();
                const serviceID = 'service_boj7ewz';
                const templateID = 'template_1agk5zn';

                await emailjsInstance.sendForm(serviceID, templateID, contactForm);

                contactForm.reset();
                showToast("Message sent successfully! We will contact you shortly.", "success");
                formFeedback.textContent = "Thank you! Your message has been received.";
                formFeedback.className = "form-feedback-message success";

                setTimeout(() => {
                    formFeedback.textContent = "";
                    formFeedback.className = "form-feedback-message";
                }, 6000);
            } catch (err) {
                showToast("Failed to send message. Please try again.", "error");
                formFeedback.textContent = "Error sending message. Please try again.";
                formFeedback.className = "form-feedback-message error";
                console.error('EmailJS Error:', err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonContent;
            }
        });
    }

    // ---------------------------------------------------------
    // 11. Theme Toggle (Night / Light Mode)
    // ---------------------------------------------------------
    let isThemeTransitioning = false;

    const setTheme = (theme, animate = false) => {
        if (animate) {
            document.documentElement.classList.add('theme-transitioning');
            if (themeToggle) themeToggle.classList.add('toggling');
            if (themeToggleMobile) themeToggleMobile.classList.add('toggling');
        }

        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (_) {}

        const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';

        if (animate) {
            setTimeout(() => {
                if (themeToggle) {
                    const toggleIcon = themeToggle.querySelector('i');
                    if (toggleIcon) toggleIcon.className = iconClass;
                    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
                }
                if (themeToggleMobile) {
                    themeToggleMobile.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i> ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`;
                    themeToggleMobile.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
                }
            }, 180);

            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
                if (themeToggle) themeToggle.classList.remove('toggling');
                if (themeToggleMobile) themeToggleMobile.classList.remove('toggling');
                isThemeTransitioning = false;
            }, 500);
        } else {
            if (themeToggle) {
                const toggleIcon = themeToggle.querySelector('i');
                if (toggleIcon) toggleIcon.className = iconClass;
                themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            }
            if (themeToggleMobile) {
                themeToggleMobile.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i> ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`;
                themeToggleMobile.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            }
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme, false);

    const handleThemeToggleClick = (e) => {
        if (e) e.preventDefault();
        if (isThemeTransitioning) return;
        isThemeTransitioning = true;
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark', true);
    };

    if (themeToggle) themeToggle.addEventListener('click', handleThemeToggleClick);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleThemeToggleClick);

    // ---------------------------------------------------------
    // 12. Highlight Stat Card Animated Counter
    // ---------------------------------------------------------
    const highlightStatNumber = document.querySelector('.stat-highlight-number[data-target]');
    if (highlightStatNumber) {
        const targetNumber = parseInt(highlightStatNumber.getAttribute('data-target'), 10) || 1000;
        let animated = false;

        const countUp = () => {
            if (animated) return;
            animated = true;
            const duration = 1400;
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const currentVal = Math.floor(easeOut * targetNumber);

                highlightStatNumber.innerHTML = `${currentVal}<span class="stat-plus-accent">+</span>`;

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    highlightStatNumber.innerHTML = `${targetNumber}<span class="stat-plus-accent">+</span>`;
                }
            };

            requestAnimationFrame(updateCount);
        };

        if ('IntersectionObserver' in window) {
            const statObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        countUp();
                        statObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            statObserver.observe(highlightStatNumber);
        } else {
            countUp();
        }
    }
});
