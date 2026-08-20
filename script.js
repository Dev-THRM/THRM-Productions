// Instant Hash Clean: If browser has a '#' from previous cache, immediately strip it
if (window.location.hash) {
    const rawHash = window.location.hash.toLowerCase();
    let initialCleanPath = '/';
    if (rawHash.includes('about')) initialCleanPath = '/about';
    else if (rawHash.includes('work')) initialCleanPath = '/work';
    else if (rawHash.includes('contact')) initialCleanPath = '/contact';
    try {
        window.history.replaceState(null, '', initialCleanPath);
    } catch (e) {}
}

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud" style="color:rgba(255,255,255,0.2)">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Clean URL routing on page load (without #)
    handleInitialRoute();

    // Splash Screen Logic (2 seconds delay)
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        
        // Trigger navbar animation
        document.body.classList.add('loaded');
        
        // Trigger Scramble Text Animation
        const scrambleElements = document.querySelectorAll('.scramble-text');
        scrambleElements.forEach((el, index) => {
            const fx = new TextScramble(el);
            // Stagger the animation slightly for each line
            setTimeout(() => {
                fx.setText(el.getAttribute('data-text'));
            }, index * 400); 
        });

        // Trigger scroll if arriving on /about or /work
        handleInitialRoute(true);
    }, 2000);

    // Helper to find target section element on home page
    function getTargetElementForPath(path) {
        const cleanPath = (path || '').toLowerCase().replace(/\/$/, '') || '/';
        if (cleanPath === '/about' || cleanPath === '/about-us' || cleanPath === '#about-us') {
            return document.getElementById('about-us');
        }
        if (cleanPath === '/work' || cleanPath === '/our-work' || cleanPath === '#our-work') {
            return document.getElementById('our-work');
        }
        return null;
    }

    // Scroll to section and update address bar cleanly (no #)
    function scrollToSection(path, updateHistory = true, action = 'push', shouldScroll = true) {
        const isHomePage = !!document.getElementById('about-us');
        if (!isHomePage) return;

        const cleanPath = (path || '').toLowerCase().replace(/\/$/, '') || '/';
        const target = getTargetElementForPath(cleanPath);

        if (target) {
            if (shouldScroll) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            if (updateHistory) {
                const canonicalPath = cleanPath.includes('about') ? '/about' : '/work';
                window.history[action + 'State'](null, '', canonicalPath);
            }
        } else if (cleanPath === '/' || cleanPath === '') {
            if (shouldScroll) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if (updateHistory) {
                window.history[action + 'State'](null, '', '/');
            }
        }
    }

    // Intercept clicks on links on home page for clean URLs
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        const isHomePage = !!document.getElementById('about-us');
        if (!isHomePage) return;

        if (href === '/about' || href === '/about-us' || href === '#about-us' ||
            href === '/work' || href === '/our-work' || href === '#our-work' ||
            (href === '/' && link.classList.contains('logo'))) {
            e.preventDefault();
            scrollToSection(href, true, 'push', true);
        }
    });

    // Handle browser Back / Forward buttons cleanly
    window.addEventListener('popstate', () => {
        const isHomePage = !!document.getElementById('about-us');
        if (isHomePage) {
            scrollToSection(window.location.pathname, false, 'replace', true);
        }
    });

    // Initial page load routing: clean any hashes and scroll to target
    function handleInitialRoute(shouldScroll = false) {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (hash) {
            const cleanPath = hash.includes('about') ? '/about' : (hash.includes('work') ? '/work' : '/');
            scrollToSection(cleanPath, true, 'replace', shouldScroll);
        } else if (path && path !== '/') {
            scrollToSection(path, false, 'replace', shouldScroll);
        }
    }

    const hero = document.querySelector('.hero');

    // Parallax effect on mouse move for the background
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30; // Max movement 30px
        const y = (e.clientY / window.innerHeight - 0.5) * 30;

        // Update CSS variables used in the transform of .hero::before
        hero.style.setProperty('--x', `${-x}px`);
        hero.style.setProperty('--y', `${-y}px`);
    });

    // Continuous Auto-sliding Testimonials Carousel
    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
        let isPaused = false;

        // Clone the content for seamless infinite scrolling
        carousel.innerHTML += carousel.innerHTML;

        // Pause slider on hover so users can read
        carousel.addEventListener('mouseenter', () => isPaused = true);
        carousel.addEventListener('mouseleave', () => isPaused = false);

        // Pause on touch for mobile users
        carousel.addEventListener('touchstart', () => isPaused = true);
        carousel.addEventListener('touchend', () => {
            setTimeout(() => isPaused = false, 1000);
        });

        function scrollContinuously() {
            if (!isPaused) {
                carousel.scrollLeft += 1; // Speed of the slider

                // If we've scrolled past the first set of items, jump back to 0
                if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
                    carousel.scrollLeft = 0;
                }
            }
            requestAnimationFrame(scrollContinuously);
        }

        // Start the animation
        requestAnimationFrame(scrollContinuously);
    }

    // Continuous Auto-sliding Video Carousel
    const videoCarousel = document.querySelector('.video-carousel');
    if (videoCarousel) {
        let isVidPaused = false;

        // Clone the content for seamless infinite scrolling
        videoCarousel.innerHTML += videoCarousel.innerHTML;

        // Pause slider on hover
        videoCarousel.addEventListener('mouseenter', () => isVidPaused = true);
        videoCarousel.addEventListener('mouseleave', () => isVidPaused = false);
        videoCarousel.addEventListener('touchstart', () => isVidPaused = true);
        videoCarousel.addEventListener('touchend', () => {
            setTimeout(() => isVidPaused = false, 1000);
        });

        function scrollVideoContinuously() {
            if (!isVidPaused) {
                videoCarousel.scrollLeft += 1.5; // Slightly faster for videos

                if (videoCarousel.scrollLeft >= videoCarousel.scrollWidth / 2) {
                    videoCarousel.scrollLeft = 0;
                }
            }
            requestAnimationFrame(scrollVideoContinuously);
        }

        requestAnimationFrame(scrollVideoContinuously);
    }

    // Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));
});
