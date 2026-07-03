// Wizard's Academy main script
console.log("Welcome to Wizard's Academy!");

document.addEventListener('DOMContentLoaded', () => {
    initMagicCursor();
    initFloatingCandles(15);
    initStars(50);
});

// Magic Wand Cursor & Sparkles
function initMagicCursor() {
    const cursor = document.getElementById('magic-cursor');
    const sparkleContainer = document.getElementById('sparkle-container');
    
    document.addEventListener('mousemove', (e) => {
        // Adjust cursor position to center the wand tip (tip is usually top-left, but we flipped it, so top-right)
        cursor.style.left = (e.clientX - 10) + 'px';
        cursor.style.top = (e.clientY - 10) + 'px';
        
        // Randomly create sparkles when moving (balanced probability)
        if (Math.random() < 0.4) {
            createSparkle(e.clientX, e.clientY, sparkleContainer);
        }
    });

    document.addEventListener('click', (e) => {
        // Create an explosion of sparkles on click (balanced count)
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
    
    // Balanced sparkle size
    const size = Math.random() * 4 + 3;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    // Slight random offset from cursor
    const offsetX = (Math.random() - 0.5) * (isExplosion ? 80 : 25);
    const offsetY = (Math.random() - 0.5) * (isExplosion ? 80 : 25);
    
    sparkle.style.left = (x + offsetX) + 'px';
    sparkle.style.top = (y + offsetY) + 'px';
    
    container.appendChild(sparkle);
    
    // Remove after animation (1.5s as per updated CSS)
    setTimeout(() => {
        sparkle.remove();
    }, 1500);
}

// Floating Candles
function initFloatingCandles(count) {
    const container = document.getElementById('candles-container');
    
    for (let i = 0; i < count; i++) {
        const candle = document.createElement('div');
        candle.classList.add('candle');
        
        // Random positions
        const left = Math.random() * 100;
        const top = Math.random() * 40 + 10; // Top half of screen mostly
        
        candle.style.left = left + '%';
        candle.style.top = top + '%';
        
        // Random animation delay
        candle.style.animationDelay = (Math.random() * 4) + 's';
        candle.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
        
        container.appendChild(candle);
    }
}

// Glowing Stars
function initStars(count) {
    const container = document.getElementById('stars-container');
    
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
