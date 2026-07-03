const CreaturesGame = {
    trust: 0, // 0 to 100
    hasBowed: false,
    hippogriffState: 'idle', // idle, angry, bowed
    
    reset: function() {
        this.trust = 0;
        this.hasBowed = false;
        this.hippogriffState = 'idle';
        this.updateUI();
        document.getElementById('creature-status-text').textContent = 'A Hippogriff is resting in the paddock. You must bow to earn its trust before you can interact with it.';
        document.getElementById('hippogriff').className = 'hippogriff';
    },

    updateUI: function() {
        const fill = document.getElementById('trust-bar-fill');
        fill.style.width = this.trust + '%';
        
        // Color gradient logic based on trust
        if (this.trust < 30) {
            fill.style.backgroundPosition = '0% 0';
        } else if (this.trust < 70) {
            fill.style.backgroundPosition = '50% 0';
        } else {
            fill.style.backgroundPosition = '100% 0';
        }
        
        document.getElementById('btn-bow').disabled = this.hasBowed;
        document.getElementById('btn-pet').disabled = !this.hasBowed;
        document.getElementById('btn-feed').disabled = !this.hasBowed || this.trust >= 100;
    },

    bow: function() {
        if (this.hasBowed) return;
        
        const hg = document.getElementById('hippogriff');
        const status = document.getElementById('creature-status-text');
        
        // Player bows (takes a second)
        document.getElementById('btn-bow').textContent = 'Bowing...';
        document.getElementById('btn-bow').disabled = true;
        status.textContent = 'You bow slowly, maintaining eye contact without blinking...';
        
        setTimeout(() => {
            // Hippogriff bows back
            hg.classList.add('bowing');
            this.hasBowed = true;
            this.hippogriffState = 'bowed';
            this.trust = 20;
            this.updateUI();
            
            document.getElementById('btn-bow').textContent = 'Bow Slowly';
            status.textContent = 'The Hippogriff bows back! You have earned its basic trust. You may now approach.';
        }, 2000);
    },

    pet: function() {
        if (!this.hasBowed) return;
        const hg = document.getElementById('hippogriff');
        const status = document.getElementById('creature-status-text');
        
        if (this.trust < 40) {
            // Might get angry
            if (Math.random() > 0.5) {
                this.trust -= 10;
                hg.classList.remove('bowing');
                hg.classList.remove('happy');
                // trigger angry animation
                hg.classList.remove('angry');
                void hg.offsetWidth; // trigger reflow
                hg.classList.add('angry');
                status.textContent = 'The Hippogriff snapped at you! You should feed it first to build more trust.';
            } else {
                this.trust += 5;
                status.textContent = 'You gently pat its beak. It seems to tolerate it.';
            }
        } else {
            this.trust += 10;
            hg.classList.remove('bowing');
            hg.classList.remove('angry');
            hg.classList.remove('happy');
            void hg.offsetWidth;
            hg.classList.add('happy');
            status.textContent = 'The Hippogriff enjoys the scratches! It lets out a happy squawk.';
            
            if (this.trust >= 100) this.trust = 100;
        }
        
        this.updateUI();
        this.checkWin();
    },

    feed: function() {
        if (!this.hasBowed) return;
        const status = document.getElementById('creature-status-text');
        const hg = document.getElementById('hippogriff');
        
        this.trust += 25;
        if (this.trust >= 100) this.trust = 100;
        
        hg.classList.remove('bowing');
        hg.classList.remove('angry');
        hg.classList.remove('happy');
        void hg.offsetWidth;
        hg.classList.add('happy');
        
        status.textContent = 'You toss a dead ferret to the Hippogriff. It catches it mid-air and swallows it whole. Trust increased significantly!';
        
        this.updateUI();
        this.checkWin();
    },

    checkWin: function() {
        if (this.trust >= 100 && this.hippogriffState !== 'won') {
            this.hippogriffState = 'won';
            setTimeout(() => {
                const xpGain = 100;
                const coinsGain = 20;
                RPGEngine.currentUser.xp += xpGain;
                RPGEngine.currentUser.coins += coinsGain;
                RPGEngine.checkLevelUp();
                RPGEngine.saveProgress();
                RPGEngine.updateQuestProgress('play_game', 1);
                
                alert(`You have fully tamed the Hippogriff! You gained ${xpGain} XP and ${coinsGain} Galleons!`);
                document.getElementById('creature-status-text').textContent = 'The Hippogriff fully trusts you. It allows you to ride it around the paddock!';
                document.getElementById('btn-pet').disabled = true;
                document.getElementById('btn-feed').disabled = true;
            }, 500);
        }
    }
};

document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-creatures') {
        CreaturesGame.reset();
    }
});
