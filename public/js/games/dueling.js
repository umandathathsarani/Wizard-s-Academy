const DuelingGame = {
    playerHp: 100,
    enemyHp: 100,
    isGameOver: false,

    init: function() {
        if(!RPGEngine.currentUser) return magicalAlert("Log in first!");
        this.playerHp = 100;
        this.enemyHp = 100;
        this.isGameOver = false;
        
        document.getElementById('duel-player-name').textContent = RPGEngine.currentUser.name;
        
        this.updateHealthUI();
        
        document.getElementById('combat-actions').classList.remove('hidden');
        document.getElementById('combat-restart').classList.add('hidden');
        
        const log = document.getElementById('combat-log');
        log.innerHTML = '';
        this.logMessage('Welcome to the Dueling Club! The dummy is ready.', 'system');
    },

    updateHealthUI: function() {
        document.getElementById('duel-player-hp').style.width = this.playerHp + '%';
        document.getElementById('duel-enemy-hp').style.width = this.enemyHp + '%';
        
        if (this.playerHp <= 20) document.getElementById('duel-player-hp').style.background = '#c0392b';
        else document.getElementById('duel-player-hp').style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    },

    logMessage: function(msg, type) {
        const log = document.getElementById('combat-log');
        const p = document.createElement('p');
        p.className = `log-${type}`;
        p.textContent = msg;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    },

    castSpell: function(playerSpell) {
        if (this.isGameOver) return;
        
        // Enemy AI (Random)
        const spells = ['offensive', 'defensive', 'healing'];
        const enemySpell = spells[Math.floor(Math.random() * spells.length)];
        
        this.resolveRound(playerSpell, enemySpell);
    },

    resolveRound: function(pSpell, eSpell) {
        let pDamage = 0;
        let eDamage = 0;
        let pHeal = 0;
        let eHeal = 0;
        
        // Base values
        if (pSpell === 'offensive') pDamage = 20;
        if (pSpell === 'healing') pHeal = 15;
        
        if (eSpell === 'offensive') eDamage = 20;
        if (eSpell === 'healing') eHeal = 15;
        
        // Interactions
        if (pSpell === 'defensive' && eSpell === 'offensive') {
            eDamage = 0;
            this.logMessage('You cast Protego! The dummy\'s attack bounced off.', 'player');
        }
        if (eSpell === 'defensive' && pSpell === 'offensive') {
            pDamage = 0;
            this.logMessage('The dummy cast Protego! Your attack was blocked.', 'enemy');
        }
        
        // Apply effects
        if (pSpell === 'offensive' && pDamage > 0) {
            this.enemyHp -= pDamage;
            this.logMessage('You hit the dummy with Expelliarmus! (20 DMG)', 'player');
        } else if (pSpell === 'healing') {
            this.playerHp = Math.min(100, this.playerHp + pHeal);
            this.logMessage('You cast Vulnera Sanentur. (+15 HP)', 'player');
        } else if (pSpell === 'defensive' && eSpell !== 'offensive') {
            this.logMessage('You cast Protego, but the dummy didn\'t attack.', 'player');
        }

        if (eSpell === 'offensive' && eDamage > 0) {
            this.playerHp -= eDamage;
            this.logMessage('The dummy fired a stunning spell! (20 DMG)', 'enemy');
        } else if (eSpell === 'healing') {
            this.enemyHp = Math.min(100, this.enemyHp + eHeal);
            this.logMessage('The dummy heals itself. (+15 HP)', 'enemy');
        } else if (eSpell === 'defensive' && pSpell !== 'offensive') {
            this.logMessage('The dummy cast Protego, but you didn\'t attack.', 'enemy');
        }
        
        this.updateHealthUI();
        this.checkWinCondition();
    },

    checkWinCondition: function() {
        if (this.playerHp <= 0 && this.enemyHp <= 0) {
            this.playerHp = 0;
            this.enemyHp = 0;
            this.endGame('draw');
        } else if (this.playerHp <= 0) {
            this.playerHp = 0;
            this.endGame('lose');
        } else if (this.enemyHp <= 0) {
            this.enemyHp = 0;
            this.endGame('win');
        }
        this.updateHealthUI();
    },

    endGame: function(result) {
        this.isGameOver = true;
        document.getElementById('combat-actions').classList.add('hidden');
        document.getElementById('combat-restart').classList.remove('hidden');
        
        if (result === 'win') {
            this.logMessage('VICTORY! You defeated the dummy.', 'system');
            
            const xpGain = 50;
            const coinsGain = 15;
            const score = this.playerHp; // Score is remaining HP
            
            setTimeout(() => {
                magicalAlert(`You won! Gained ${xpGain} XP and ${coinsGain} Galleons.`).then(() => {
                    if (typeof showNamePrompt !== 'undefined') {
                        showNamePrompt('dueling', score, xpGain, coinsGain);
                    }
                });
            }, 500);
        } else if (result === 'lose') {
            this.logMessage('DEFEAT. The dummy knocked you out.', 'system');
            setTimeout(() => magicalAlert('You lost the duel. Better luck next time!'), 500);
        } else {
            this.logMessage('DRAW. You both went down simultaneously.', 'system');
            setTimeout(() => magicalAlert('It\'s a draw!'), 500);
        }
    }
};

document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-dueling') {
        DuelingGame.init();
    }
});
