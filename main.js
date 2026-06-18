// Slider
const slides = document.querySelectorAll('.hero-services .slide');
const dots = document.querySelectorAll('.slider-dot');
let current = 0;
let autoplay;

function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

function nextSlideAuto() {
    goToSlide((current + 1) % slides.length);
}

function nextSlide() {
    clearInterval(autoplay);
    nextSlideAuto();
    autoplay = setInterval(nextSlideAuto, 8000);
}

function prevSlide() {
    clearInterval(autoplay);
    goToSlide((current - 1 + slides.length) % slides.length);
    autoplay = setInterval(nextSlideAuto, 8000);
}

dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        clearInterval(autoplay);
        goToSlide(i);
        autoplay = setInterval(nextSlideAuto, 8000);
    });
});

document.querySelector('.prev-arrow').addEventListener('click', prevSlide);
document.querySelector('.next-arrow').addEventListener('click', nextSlide);

// Touch swipe
const heroServices = document.querySelector('.hero-services');
let touchStartX = 0;

heroServices.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

heroServices.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
}, { passive: true });

// Video hero
const heroVideo = document.querySelector('.hero-video-right');
const heroText = document.querySelector('.hero-text');
let heroShown = false;

function showHero() {
    if (heroShown) return;
    heroShown = true;
    heroText.classList.add('show-hero-text');
    autoplay = setInterval(nextSlideAuto, 8000);
}

if (heroVideo && heroText) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    function tryPlay() {
        if (!heroVideo.paused || heroVideo.ended) return;
        heroVideo.play().catch(() => {});
    }

    tryPlay();
    heroVideo.addEventListener('canplay', tryPlay, { once: true });

    const videoObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            tryPlay();
            videoObserver.disconnect();
        }
    }, { threshold: 0.1 });
    videoObserver.observe(heroVideo);

    window.addEventListener('pageshow', tryPlay);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tryPlay();
    });

    ['touchstart', 'click'].forEach(evt => {
        document.addEventListener(evt, function handler() {
            tryPlay();
            document.removeEventListener(evt, handler);
        }, { once: true, passive: true });
    });

    const playOverlay = document.getElementById('videoPlayOverlay');
    heroVideo.addEventListener('playing', () => {
        playOverlay.classList.remove('visible');
    }, { once: true });
    setTimeout(() => {
        if (heroVideo.paused && !heroVideo.ended) playOverlay.classList.add('visible');
    }, 2000);
    playOverlay.addEventListener('click', () => {
        heroVideo.play().catch(() => {});
    });

    heroVideo.addEventListener('timeupdate', () => {
        if (!heroVideo.duration) return;
        const remaining = heroVideo.duration - heroVideo.currentTime;
        if (remaining <= 1.0) showHero();
        if (remaining <= 0.1) heroVideo.pause();
    });

    let textTimer = null;
    heroVideo.addEventListener('playing', () => {
        clearTimeout(textTimer);
        if (!heroVideo.duration) return;
        const remaining = heroVideo.duration - heroVideo.currentTime;
        textTimer = setTimeout(showHero, Math.max(0, (remaining - 1) * 1000));
    });

    heroVideo.addEventListener('ended', () => {
        showHero();
        heroVideo.pause();
    });

    setTimeout(showHero, 12000);
}
