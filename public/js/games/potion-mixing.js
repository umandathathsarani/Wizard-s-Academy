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
    
    const sequenceLength = 2 + Math.floor((potionLevel + 1) / 2);
    potionSequence = [];
    for(let i=0; i<sequenceLength; i++) {
        potionSequence.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
    }
    
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
            }, 1500);
        }
    }, 600);
}

function selectIngredient(ing) {
    if(isShowingSequence) return;
    
    playerSequence.push(ing);
    
    const currentIndex = playerSequence.length - 1;
    if(playerSequence[currentIndex] !== potionSequence[currentIndex]) {
        potionExplosion();
        return;
    }
    
    document.getElementById('cauldron-liquid').style.background = getRandomColor();
    
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
    document.getElementById('cauldron-liquid').style.background = '#f87171';
    document.getElementById('potion-play-screen').classList.add('hidden');
    document.getElementById('potion-end-screen').classList.remove('hidden');
    document.getElementById('potion-final-score').textContent = potionScore;
}

function getRandomColor() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}
