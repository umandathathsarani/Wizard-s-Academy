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
let spellScore = 0;
let spellTimeLeft = 30;
let spellGameInterval = null;

function startSpellCasting() {
    spellScore = 0;
    spellTimeLeft = 30;
    document.getElementById('spell-score').textContent = spellScore;
    document.getElementById('spell-timer').textContent = spellTimeLeft;
    
    document.getElementById('spell-start-screen').classList.add('hidden');
    document.getElementById('spell-end-screen').classList.add('hidden');
    document.getElementById('spell-play-screen').classList.remove('hidden');
    
    document.getElementById('spell-feedback').textContent = '';
    const input = document.getElementById('spell-input');
    input.value = '';
    input.focus();

    if (spellGameInterval) clearInterval(spellGameInterval);
    spellGameInterval = setInterval(updateSpellTimer, 1000);

    nextSpell();
}

function updateSpellTimer() {
    spellTimeLeft--;
    document.getElementById('spell-timer').textContent = spellTimeLeft;
    
    if (spellTimeLeft <= 0) {
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

document.getElementById('spell-input')?.addEventListener('input', (e) => {
    const typed = e.target.value;
    const feedback = document.getElementById('spell-feedback');
    
    if (typed === currentSpell) {
        spellScore += 10;
        document.getElementById('spell-score').textContent = spellScore;
        feedback.textContent = '✨ Excellent!';
        feedback.classList.remove('error');
        
        setTimeout(() => {
            feedback.textContent = '';
            nextSpell();
        }, 300);
    } else if (!currentSpell.startsWith(typed)) {
        feedback.textContent = '❌ Incorrect incantation!';
        feedback.classList.add('error');
    } else {
        feedback.textContent = '';
        feedback.classList.remove('error');
    }
});

function endSpellCasting() {
    clearInterval(spellGameInterval);
    document.getElementById('spell-play-screen').classList.add('hidden');
    document.getElementById('spell-end-screen').classList.remove('hidden');
    document.getElementById('spell-final-score').textContent = spellScore;
}

function endGame(menuViewId) {
    if (spellGameInterval) clearInterval(spellGameInterval);
    navigateTo(menuViewId);
}
