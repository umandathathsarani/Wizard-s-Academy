// Wizard's Academy - AAA Main Script
console.log("Welcome to Wizard's Academy!");

let audioContextStarted = false;
const ambientAudio = document.getElementById('audio-ambient');
const hoverAudio = document.getElementById('audio-hover');
const clickAudio = document.getElementById('audio-click');

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initMagicCursor();
    initFloatingCandles(20);
    initStars(100);
    initAudioInteractions();
    initParallax();
});

function initPreloader() {
    // Simulate loading time for cinematic effect
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
        gsap.fromTo('.gs-title', 
            { y: 50, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' }
        );
        gsap.fromTo('.gs-subtitle',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, delay: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo('.gs-divider',
            { width: 0, opacity: 0 },
            { width: '100%', opacity: 1, duration: 1, delay: 0.6, ease: 'power2.out' }
        );
        gsap.fromTo('.gs-btn',
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.8, ease: 'back.out(1.2)' }
        );
        gsap.fromTo('.top-nav',
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'power2.out' }
        );
    }
}

function initAudioInteractions() {
    if(!ambientAudio || !hoverAudio || !clickAudio) return;

    // Start ambient on first interaction (due to browser policy)
    document.body.addEventListener('click', () => {
        if (!audioContextStarted) {
            ambientAudio.volume = 0.2;
            ambientAudio.play().catch(e => console.log('Audio play blocked:', e));
            audioContextStarted = true;
        }
    }, { once: true });

    // Button sounds
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
                gsap.to(layer, {
                    x: -x * depth * 50,
                    y: -y * depth * 50,
                    duration: 1,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }
        });
    });
}

// Magic Wand Cursor & Sparkles
function initMagicCursor() {
    const cursor = document.getElementById('magic-cursor');
    const sparkleContainer = document.getElementById('sparkle-container');
    if(!cursor || !sparkleContainer) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = (e.clientX - 10) + 'px';
        cursor.style.top = (e.clientY - 10) + 'px';
        
        if (Math.random() < 0.4) {
            createSparkle(e.clientX, e.clientY, sparkleContainer);
        }
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
    
    // Pass target translate variables to CSS for explosion animation
    sparkle.style.setProperty('--tx', `${offsetX}px`);
    sparkle.style.setProperty('--ty', `${offsetY}px`);
    
    container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1500);
}

// Floating Candles
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

// Glowing Stars
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

// SPA Navigation
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

// --- Spell Casting Game Logic ---
const spells = [
    "Wingardium Leviosa",
    "Expelliarmus",
    "Lumos",
    "Alohomora",
    "Expecto Patronum",
    "Avada Kedavra",
    "Crucio",
    "Imperio",
    "Protego",
    "Accio",
    "Stupefy",
    "Riddikulus"
];

let currentSpell = "";
let score = 0;
let timeLeft = 30;
let gameInterval = null;

function startSpellCasting() {
    // Reset state
    score = 0;
    timeLeft = 30;
    document.getElementById('spell-score').textContent = score;
    document.getElementById('spell-timer').textContent = timeLeft;
    
    // UI swaps
    document.getElementById('spell-start-screen').classList.add('hidden');
    document.getElementById('spell-end-screen').classList.add('hidden');
    document.getElementById('spell-play-screen').classList.remove('hidden');
    
    // Clear feedback and input
    document.getElementById('spell-feedback').textContent = '';
    const input = document.getElementById('spell-input');
    input.value = '';
    input.focus();

    // Start timer
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateTimer, 1000);

    // Load first spell
    nextSpell();
}

function updateTimer() {
    timeLeft--;
    document.getElementById('spell-timer').textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endSpellCasting();
    }
}

function nextSpell() {
    const randomIndex = Math.floor(Math.random() * spells.length);
    currentSpell = spells[randomIndex];
    document.getElementById('spell-target').textContent = currentSpell;
    
    const input = document.getElementById('spell-input');
    input.value = '';
}

// Input event listener to check spell
document.getElementById('spell-input')?.addEventListener('input', (e) => {
    const typed = e.target.value;
    const feedback = document.getElementById('spell-feedback');
    
    if (typed === currentSpell) {
        // Success
        score += 10;
        document.getElementById('spell-score').textContent = score;
        feedback.textContent = '✨ Excellent!';
        feedback.classList.remove('error');
        
        // Show next spell after a tiny delay for satisfaction
        setTimeout(() => {
            feedback.textContent = '';
            nextSpell();
        }, 300);
    } else if (!currentSpell.startsWith(typed)) {
        // Typo
        feedback.textContent = '❌ Incorrect incantation!';
        feedback.classList.add('error');
    } else {
        // Correct so far
        feedback.textContent = '';
        feedback.classList.remove('error');
    }
});

function endSpellCasting() {
    clearInterval(gameInterval);
    document.getElementById('spell-play-screen').classList.add('hidden');
    document.getElementById('spell-end-screen').classList.remove('hidden');
    document.getElementById('spell-final-score').textContent = score;
    
    // Save to leaderboard logic will go here in Phase 8
}

function endGame(menuViewId) {
    if (gameInterval) clearInterval(gameInterval);
    navigateTo(menuViewId);
}

// --- Potion Mixing Game Logic ---
const ingredients = ['🌿', '💎', '🍄', '🔥', '💧', '🦇'];
let potionSequence = [];
let playerSequence = [];
let potionLevel = 1;
let potionScore = 0;
let isShowingSequence = false;

function startPotionMixing() {
    potionLevel = 1;
    potionScore = 0;
    updatePotionUI();
    
    document.getElementById('potion-start-screen').classList.add('hidden');
    document.getElementById('potion-end-screen').classList.add('hidden');
    document.getElementById('potion-play-screen').classList.remove('hidden');
    
    document.getElementById('cauldron-liquid').style.background = 'var(--primary-color)';
    document.getElementById('potion-feedback').textContent = '';
    
    nextPotionLevel();
}

function updatePotionUI() {
    document.getElementById('potion-score').textContent = potionScore;
    document.getElementById('potion-level').textContent = potionLevel;
}

function nextPotionLevel() {
    playerSequence = [];
    isShowingSequence = true;
    document.getElementById('ingredient-buttons').classList.add('hidden');
    document.getElementById('potion-feedback').textContent = 'Memorize the recipe...';
    
    // Generate sequence (starts at 3, adds 1 every 2 levels)
    const sequenceLength = 2 + Math.floor((potionLevel + 1) / 2);
    potionSequence = [];
    for(let i=0; i<sequenceLength; i++) {
        potionSequence.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
    }
    
    // Show sequence
    const display = document.getElementById('potion-sequence-display');
    display.innerHTML = '';
    
    let i = 0;
    const showInterval = setInterval(() => {
        if(i < potionSequence.length) {
            const item = document.createElement('span');
            item.className = 'sequence-item';
            item.textContent = potionSequence[i];
            display.appendChild(item);
            i++;
        } else {
            clearInterval(showInterval);
            setTimeout(() => {
                display.innerHTML = '❔'.repeat(potionSequence.length);
                isShowingSequence = false;
                document.getElementById('ingredient-buttons').classList.remove('hidden');
                document.getElementById('potion-feedback').textContent = 'Now mix the ingredients!';
            }, 1500); // Hide after 1.5s
        }
    }, 600); // Show next item every 600ms
}

function selectIngredient(ing) {
    if(isShowingSequence) return;
    
    playerSequence.push(ing);
    
    // Check current step
    const currentIndex = playerSequence.length - 1;
    if(playerSequence[currentIndex] !== potionSequence[currentIndex]) {
        // Wrong!
        potionExplosion();
        return;
    }
    
    // Correct so far
    document.getElementById('cauldron-liquid').style.background = getRandomColor();
    
    // Check if level complete
    if(playerSequence.length === potionSequence.length) {
        isShowingSequence = true;
        document.getElementById('ingredient-buttons').classList.add('hidden');
        document.getElementById('potion-feedback').textContent = '✨ Perfect Brew!';
        
        potionScore += potionLevel * 20;
        potionLevel++;
        updatePotionUI();
        
        setTimeout(nextPotionLevel, 1500);
    }
}

function potionExplosion() {
    document.getElementById('cauldron-liquid').style.background = '#f87171'; // Red
    document.getElementById('potion-play-screen').classList.add('hidden');
    document.getElementById('potion-end-screen').classList.remove('hidden');
    document.getElementById('potion-final-score').textContent = potionScore;
}

function getRandomColor() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}
