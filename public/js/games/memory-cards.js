// --- Memory Cards Game ---
let memoryTimer = 60;
let memoryInterval;
let memoryScore = 0;
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
const memoryItems = ['🔮', '📜', '🗝️', '👑', '🐉', '🦄', '🦇', '🧪'];

function startMemoryGame() {
    document.getElementById('memory-start-screen').classList.add('hidden');
    document.getElementById('memory-end-screen').classList.add('hidden');
    document.getElementById('memory-play-screen').classList.remove('hidden');
    
    memoryTimer = 60;
    memoryScore = 0;
    matchedPairs = 0;
    flippedCards = [];
    document.getElementById('memory-score').textContent = memoryScore;
    document.getElementById('memory-timer').textContent = memoryTimer;
    
    setupMemoryBoard();
    
    clearInterval(memoryInterval);
    memoryInterval = setInterval(() => {
        memoryTimer--;
        document.getElementById('memory-timer').textContent = memoryTimer;
        if (memoryTimer <= 0) {
            endMemoryGame(false);
        }
    }, 1000);
}

function setupMemoryBoard() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    memoryCards = [...memoryItems, ...memoryItems]
        .sort(() => Math.random() - 0.5);
        
    memoryCards.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.index = index;
        card.dataset.value = item;
        
        card.innerHTML = `
            <div class="card-face card-front">${item}</div>
            <div class="card-face card-back">W</div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (flippedCards.length >= 2) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    if(typeof clickAudio !== 'undefined' && clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => {});
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.value === card2.dataset.value;
    
    if (match) {
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            memoryScore += 10;
            document.getElementById('memory-score').textContent = memoryScore;
            matchedPairs++;
            
            if (matchedPairs === memoryItems.length) {
                endMemoryGame(true);
            }
            flippedCards = [];
        }, 500);
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function endMemoryGame(won) {
    clearInterval(memoryInterval);
    document.getElementById('memory-play-screen').classList.add('hidden');
    document.getElementById('memory-end-screen').classList.remove('hidden');
    
    const title = document.getElementById('memory-end-title');
    if (won) {
        title.textContent = 'A Perfect Mind!';
        memoryScore += (memoryTimer * 2); // Time bonus
    } else {
        title.textContent = "Time's Up!";
    }
    document.getElementById('memory-final-score').textContent = memoryScore;
}
