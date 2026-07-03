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

