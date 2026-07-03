const HerbologyGame = {
    score: 0,
    stamina: 100,
    timeLeft: 30,
    isPlaying: false,
    activePots: new Set(),
    timers: {},
    gameInterval: null,

    init: function() {
        const grid = document.getElementById('pots-grid');
        grid.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const pot = document.createElement('div');
            pot.className = 'pot';
            pot.onclick = () => this.clickPot(i);
            
            const mandrake = document.createElement('div');
            mandrake.className = 'mandrake';
            mandrake.textContent = '🪴'; // Using a plant/creature emoji
            
            pot.appendChild(mandrake);
            grid.appendChild(pot);
        }
        this.reset();
    },

    reset: function() {
        this.score = 0;
        this.stamina = 100;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.activePots.clear();
        this.updateHUD();
        
        document.getElementById('herb-start-screen').classList.remove('hidden');
        
        const pots = document.querySelectorAll('.pot');
        pots.forEach(p => p.classList.remove('active'));
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        for (let id in this.timers) clearTimeout(this.timers[id]);
        this.timers = {};
    },

    start: function() {
        if (!RPGEngine.currentUser) return alert("Log in first!");
        
        document.getElementById('herb-start-screen').classList.add('hidden');
        this.isPlaying = true;
        
        this.gameInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            this.timeLeft--;
            document.getElementById('herb-time').textContent = this.timeLeft;
            
            // Stamina drain from active mandrakes
            if (this.activePots.size > 0) {
                this.stamina -= this.activePots.size * 2;
                this.updateHUD();
            }
            
            // Spawn new mandrake
            if (Math.random() > 0.3) {
                this.spawnMandrake();
            }
            
            // Check end conditions
            if (this.timeLeft <= 0 || this.stamina <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    spawnMandrake: function() {
        if (this.activePots.size >= 9) return;
        
        let potId;
        do {
            potId = Math.floor(Math.random() * 9);
        } while (this.activePots.has(potId));
        
        this.activePots.add(potId);
        const pots = document.querySelectorAll('.pot');
        pots[potId].classList.add('active');
        
        // Auto hide after some time if not clicked, doing massive stamina damage
        this.timers[potId] = setTimeout(() => {
            if (this.activePots.has(potId)) {
                this.activePots.delete(potId);
                pots[potId].classList.remove('active');
                this.stamina -= 15;
                this.updateHUD();
            }
        }, 3000 + Math.random() * 2000);
    },

    clickPot: function(potId) {
        if (!this.isPlaying || !this.activePots.has(potId)) return;
        
        this.activePots.delete(potId);
        const pots = document.querySelectorAll('.pot');
        pots[potId].classList.remove('active');
        clearTimeout(this.timers[potId]);
        
        this.score += 10;
        this.updateHUD();
    },

    updateHUD: function() {
        document.getElementById('herb-score').textContent = this.score;
        const stamFill = document.getElementById('herb-stamina');
        stamFill.style.width = Math.max(0, this.stamina) + '%';
        
        if (this.stamina < 30) {
            stamFill.style.background = '#e74c3c';
        } else {
            stamFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        }
    },

    endGame: function() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        for (let id in this.timers) clearTimeout(this.timers[id]);
        
        document.getElementById('herb-start-screen').classList.remove('hidden');
        document.getElementById('herb-start-screen').querySelector('button').textContent = "Play Again";
        
        const isWin = this.stamina > 0 && this.score > 50;
        
        if (isWin) {
            const xpGain = Math.floor(this.score / 2);
            const coinsGain = Math.floor(this.score / 5);
            RPGEngine.currentUser.xp += xpGain;
            RPGEngine.currentUser.coins += coinsGain;
            RPGEngine.checkLevelUp();
            RPGEngine.saveProgress();
            RPGEngine.updateQuestProgress('play_game', 1);
            
            setTimeout(() => alert(`Class complete! You scored ${this.score}. Gained ${xpGain} XP and ${coinsGain} Galleons.`), 100);
        } else {
            setTimeout(() => alert(`You passed out from the screaming! Score: ${this.score}. Try again.`), 100);
        }
    }
};

document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-herbology') {
        HerbologyGame.init();
    }
});
