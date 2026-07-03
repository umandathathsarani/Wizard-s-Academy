const DivinationGame = {
    fortunes: [
        "A dark shadow looms in your near future... but it is only a very large owl delivering a package.",
        "You will find unexpected wealth in the cushions of the Gryffindor common room sofa.",
        "Beware of cauldrons that bubble purple. They are not what they seem.",
        "A true friend will soon ask to copy your potion's homework. Choose wisely.",
        "The Grim! ... Wait, no, just a smudge on the crystal. You're fine.",
        "Success is in your future, provided you remember the incantation.",
        "Avoid the third-floor corridor today. The stairs are feeling mischievous."
    ],
    hasGazedToday: false,
    isGazing: false,

    gaze: function() {
        if (!RPGEngine.currentUser) return magicalAlert('You must be logged in to gaze into the crystal ball!');
        if (this.hasGazedToday) return magicalAlert('The mists have settled. The future can only be read once per visit.');
        if (this.isGazing) return;

        this.isGazing = true;
        const ball = document.getElementById('crystal-ball');
        ball.classList.add('gazing');
        
        document.getElementById('fortune-display').classList.add('hidden');
        
        setTimeout(() => {
            ball.classList.remove('gazing');
            this.revealFortune();
        }, 1500);
    },

    revealFortune: function() {
        this.hasGazedToday = true;
        this.isGazing = false;
        const fortuneDisplay = document.getElementById('fortune-display');
        const fortuneText = document.getElementById('fortune-text');
        const rewardText = document.getElementById('fortune-reward');

        // Pick random fortune
        const randomFortune = this.fortunes[Math.floor(Math.random() * this.fortunes.length)];
        fortuneText.textContent = `"${randomFortune}"`;

        // Grant reward
        const isCoins = Math.random() > 0.5;
        const amount = Math.floor(Math.random() * 30) + 10;
        
        if (isCoins) {
            RPGEngine.currentUser.coins += amount;
            rewardText.textContent = `The mists have granted you +${amount} Galleons!`;
        } else {
            RPGEngine.currentUser.xp += amount;
            rewardText.textContent = `The mists have granted you +${amount} XP!`;
            RPGEngine.checkLevelUp();
        }

        RPGEngine.saveProgress();
        RPGEngine.updateQuestProgress('play_game', 1);
        
        fortuneDisplay.classList.remove('hidden');
    },

    reset: function() {
        this.hasGazedToday = false;
        this.isGazing = false;
        document.getElementById('fortune-display').classList.add('hidden');
    }
};

document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-divination') {
        DivinationGame.reset();
    }
});
