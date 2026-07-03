// Wizard's Academy - Core Script
console.log("Welcome to Wizard's Academy!");

let audioContextStarted = false;
const ambientAudio = document.getElementById('audio-ambient');
const hoverAudio = document.getElementById('audio-hover');
const clickAudio = document.getElementById('audio-click');

document.addEventListener('DOMContentLoaded', async () => {
    await loadViews();
    initPreloader();
    initMagicCursor();
    initFloatingCandles(20);
    initStars(100);
    initAudioInteractions();
    initParallax();
});

async function loadViews() {
    const views = [
        'home', 'games', 'spell-casting', 
        'potion-mixing', 'memory-cards', 
        'house-quiz', 'flying-challenge'
    ];
    
    for (const view of views) {
        try {
            const response = await fetch(`views/${view}.html`);
            if (response.ok) {
                const html = await response.text();
                const container = document.getElementById(`view-${view}`);
                if (container) container.innerHTML = html;
            }
        } catch (error) {
            console.error(`Failed to load view: ${view}`, error);
        }
    }
}

function initPreloader() {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.visibility = 'hidden';
            playEntranceAnimations();
        }, 1000);
    }, 1500);
}

function playEntranceAnimations() {
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.gs-title', { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' });
        gsap.fromTo('.gs-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, delay: 0.3, ease: 'power2.out' });
        gsap.fromTo('.gs-divider', { width: 0, opacity: 0 }, { width: '100%', opacity: 1, duration: 1, delay: 0.6, ease: 'power2.out' });
        gsap.fromTo('.gs-btn', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.8, ease: 'back.out(1.2)' });
        gsap.fromTo('.top-nav', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'power2.out' });
    }
}

function initAudioInteractions() {
    if(!ambientAudio || !hoverAudio || !clickAudio) return;
    document.body.addEventListener('click', () => {
        if (!audioContextStarted) {
            ambientAudio.volume = 0.2;
            ambientAudio.play().catch(e => console.log('Audio play blocked:', e));
            audioContextStarted = true;
        }
    }, { once: true });

    document.querySelectorAll('.magical-btn, .nav-links span, .game-card, .ingredient-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            hoverAudio.currentTime = 0;
            hoverAudio.volume = 0.3;
            hoverAudio.play().catch(e => {});
        });
        el.addEventListener('click', () => {
            clickAudio.currentTime = 0;
            clickAudio.volume = 0.5;
            clickAudio.play().catch(e => {});
        });
    });
}

function initParallax() {
    if (typeof gsap === 'undefined') return;
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        document.querySelectorAll('.parallax-layer').forEach(layer => {
            const depth = parseFloat(layer.getAttribute('data-depth') || '0');
            if (depth > 0) {
                gsap.to(layer, { x: -x * depth * 50, y: -y * depth * 50, duration: 1, ease: 'power2.out', overwrite: 'auto' });
            }
        });
    });
}

function initMagicCursor() {
    const cursor = document.getElementById('magic-cursor');
    const sparkleContainer = document.getElementById('sparkle-container');
    if(!cursor || !sparkleContainer) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = (e.clientX - 10) + 'px';
        cursor.style.top = (e.clientY - 10) + 'px';
        if (Math.random() < 0.4) createSparkle(e.clientX, e.clientY, sparkleContainer);
    });

    document.addEventListener('click', (e) => {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createSparkle(e.clientX, e.clientY, sparkleContainer, true);
            }, i * 15);
        }
    });
}

function createSparkle(x, y, container, isExplosion = false) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    const size = Math.random() * 4 + 3;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    const offsetX = (Math.random() - 0.5) * (isExplosion ? 120 : 30);
    const offsetY = (Math.random() - 0.5) * (isExplosion ? 120 : 30);
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.setProperty('--tx', `${offsetX}px`);
    sparkle.style.setProperty('--ty', `${offsetY}px`);
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1500);
}

function initFloatingCandles(count) {
    const container = document.getElementById('candles-container');
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const candle = document.createElement('div');
        candle.classList.add('candle');
        candle.style.left = Math.random() * 100 + '%';
        candle.style.top = Math.random() * 80 + 10 + '%';
        candle.style.animationDelay = (Math.random() * 4) + 's';
        candle.style.transform = `scale(${Math.random() * 0.4 + 0.6})`;
        container.appendChild(candle);
    }
}

function initStars(count) {
    const container = document.getElementById('stars-container');
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = (Math.random() * 5) + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        container.appendChild(star);
    }
}

function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    }
}

function selectHouse(houseName) {
    if(clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.volume = 0.5;
        clickAudio.play().catch(e => {});
    }
    const houseColors = {
        gryffindor: '#E25822',
        ravenclaw: '#0E1A40',
        slytherin: '#1A472A',
        hufflepuff: '#F0C75E'
    };
    if (houseColors[houseName]) {
        document.documentElement.style.setProperty('--primary-color', houseColors[houseName]);
        document.documentElement.style.setProperty('--accent-glow', houseColors[houseName]);
    }
}

function toggleAudio() {
    if (!ambientAudio) return;
    const statusSpan = document.getElementById('audio-status');
    const audioIcon = document.querySelector('.audio-icon');
    if (ambientAudio.paused) {
        ambientAudio.play().catch(e => console.log('Play blocked', e));
        statusSpan.textContent = 'ON';
        if (audioIcon) audioIcon.textContent = '🔊';
    } else {
        ambientAudio.pause();
        statusSpan.textContent = 'OFF';
        if (audioIcon) audioIcon.textContent = '🔇';
    }
}
