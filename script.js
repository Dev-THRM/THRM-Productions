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
    }, 2000);

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
