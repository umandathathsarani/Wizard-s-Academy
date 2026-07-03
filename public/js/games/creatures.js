const creatureData = [
    {
        name: 'Hippogriff',
        emoji: '🦅',
        intro: 'A Hippogriff is resting in the paddock. You must bow to earn its trust before you can interact with it.',
        actions: ['Bow Slowly', 'Pet Beak', 'Feed Ferret'],
        msgs: {
            bowStart: 'You bow slowly, maintaining eye contact without blinking...',
            bowSuccess: 'The Hippogriff bows back! You have earned its basic trust. You may now approach.',
            angry: 'The Hippogriff snapped at you! You should feed it first to build more trust.',
            pet: 'You gently pat its beak. It seems to tolerate it.',
            happy: 'The Hippogriff enjoys the scratches! It lets out a happy squawk.',
            feed: 'You toss a dead ferret to the Hippogriff. It catches it mid-air and swallows it whole. Trust increased significantly!',
            winAlert: 'You have fully tamed the Hippogriff!',
            winText: 'The Hippogriff fully trusts you. It allows you to ride it around the paddock!'
        }
    },
    {
        name: 'Niffler',
        emoji: '🦦',
        intro: 'A Niffler is sniffing around the paddock looking for shiny things.',
        actions: ['Wiggle Coin', 'Tickle Tummy', 'Give Galleon'],
        msgs: {
            bowStart: 'You wiggle a shiny Galleon to catch its attention...',
            bowSuccess: 'The Niffler waddles over, mesmerized by the coin! You have its attention.',
            angry: 'The Niffler tried to bite your finger to steal your ring!',
            pet: 'You tickle its tummy. Coins jingle inside its pouch.',
            happy: 'The Niffler squeaks happily as you scratch its chin!',
            feed: 'You give it a Galleon. It quickly stuffs it in its pouch. Trust increased!',
            winAlert: 'You have won the Niffler\'s heart!',
            winText: 'The Niffler fully trusts you. It even gave you back a stolen knut!'
        }
    },
    {
        name: 'Bowtruckle',
        emoji: '🌱',
        intro: 'A Bowtruckle is guarding its tree suspiciously. Approach carefully.',
        actions: ['Offer Woodlice', 'Speak Softly', 'Pet Leaves'],
        msgs: {
            bowStart: 'You slowly offer a handful of fresh woodlice...',
            bowSuccess: 'The Bowtruckle cautiously steps onto your hand to eat.',
            angry: 'The Bowtruckle jabbed you with its sharp wooden fingers!',
            pet: 'You speak softly to it. It seems calm.',
            happy: 'The Bowtruckle chatters happily and hugs your finger!',
            feed: 'You gently pet its leafy hair. It purrs like a tiny wooden cat.',
            winAlert: 'The Bowtruckle has befriended you!',
            winText: 'The Bowtruckle fully trusts you. It refuses to leave your pocket!'
        }
    },
    {
        name: 'Thestral',
        emoji: '🦇',
        intro: 'A skeletal Thestral approaches cautiously. Only those who have seen death can see it.',
        actions: ['Approach Slowly', 'Stroke Neck', 'Feed Meat'],
        msgs: {
            bowStart: 'You slowly approach the winged horse with empty hands...',
            bowSuccess: 'The Thestral sniffs your hand and allows you to stand near.',
            angry: 'The Thestral shied away and let out an eerie shriek!',
            pet: 'You gently stroke its leathery neck.',
            happy: 'The Thestral nudges you affectionately!',
            feed: 'You offer it a chunk of raw meat. It eats it eagerly. Trust increased!',
            winAlert: 'The Thestral accepts you!',
            winText: 'The Thestral fully trusts you. You can now fly on its back!'
        }
    }
];

const CreaturesGame = {
    trust: 0,
    hasBowed: false,
    creatureState: 'idle',
    currentIndex: 0,
    
    reset: function() {
        this.trust = 0;
        this.hasBowed = false;
        this.creatureState = 'idle';
        
        const c = creatureData[this.currentIndex];
        
        document.getElementById('btn-restart').classList.add('hidden');
        document.getElementById('btn-bow').classList.remove('hidden');
        document.getElementById('btn-pet').classList.remove('hidden');
        document.getElementById('btn-feed').classList.remove('hidden');
        
        document.getElementById('btn-bow').textContent = c.actions[0];
        document.getElementById('btn-pet').textContent = c.actions[1];
        document.getElementById('btn-feed').textContent = c.actions[2];
        
        document.getElementById('trust-label').textContent = `${c.name} Trust`;
        document.getElementById('creature-status-text').textContent = c.intro;
        
        const icon = document.getElementById('creature-icon');
        icon.className = 'creature-icon';
        icon.textContent = c.emoji;
        
        this.updateUI();
    },

    nextCreature: function() {
        this.currentIndex = (this.currentIndex + 1) % creatureData.length;
        this.reset();
    },

    updateUI: function() {
        const fill = document.getElementById('trust-bar-fill');
        fill.style.width = this.trust + '%';
        
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
        const c = creatureData[this.currentIndex];
        
        const icon = document.getElementById('creature-icon');
        const status = document.getElementById('creature-status-text');
        
        document.getElementById('btn-bow').textContent = '...';
        document.getElementById('btn-bow').disabled = true;
        status.textContent = c.msgs.bowStart;
        
        setTimeout(() => {
            icon.classList.add('bowing');
            this.hasBowed = true;
            this.creatureState = 'bowed';
            this.trust = 20;
            this.updateUI();
            
            document.getElementById('btn-bow').textContent = c.actions[0];
            status.textContent = c.msgs.bowSuccess;
        }, 2000);
    },

    pet: function() {
        if (!this.hasBowed) return;
        const c = creatureData[this.currentIndex];
        const icon = document.getElementById('creature-icon');
        const status = document.getElementById('creature-status-text');
        
        if (this.trust < 40) {
            if (Math.random() > 0.5) {
                this.trust -= 10;
                icon.classList.remove('bowing', 'happy', 'angry');
                void icon.offsetWidth;
                icon.classList.add('angry');
                status.textContent = c.msgs.angry;
            } else {
                this.trust += 5;
                status.textContent = c.msgs.pet;
            }
        } else {
            this.trust += 10;
            icon.classList.remove('bowing', 'angry', 'happy');
            void icon.offsetWidth;
            icon.classList.add('happy');
            status.textContent = c.msgs.happy;
            if (this.trust > 100) this.trust = 100;
        }
        
        this.updateUI();
        this.checkWin();
    },

    feed: function() {
        if (!this.hasBowed) return;
        const c = creatureData[this.currentIndex];
        const icon = document.getElementById('creature-icon');
        const status = document.getElementById('creature-status-text');
        
        this.trust += 25;
        if (this.trust > 100) this.trust = 100;
        
        icon.classList.remove('bowing', 'angry', 'happy');
        void icon.offsetWidth;
        icon.classList.add('happy');
        
        status.textContent = c.msgs.feed;
        
        this.updateUI();
        this.checkWin();
    },

    checkWin: function() {
        if (this.trust >= 100 && this.creatureState !== 'won') {
            this.creatureState = 'won';
            const c = creatureData[this.currentIndex];
            setTimeout(async () => {
                const xpGain = 100;
                const coinsGain = 20;
                await RPGEngine.addXP(xpGain);
                await RPGEngine.addCoins(coinsGain);
                await RPGEngine.updateQuestProgress('play_game', 1);
                
                magicalAlert(`${c.msgs.winAlert} You gained ${xpGain} XP and ${coinsGain} Galleons!`);
                document.getElementById('creature-status-text').textContent = c.msgs.winText;
                document.getElementById('btn-pet').disabled = true;
                document.getElementById('btn-feed').disabled = true;
                
                document.getElementById('btn-bow').classList.add('hidden');
                document.getElementById('btn-pet').classList.add('hidden');
                document.getElementById('btn-feed').classList.add('hidden');
                document.getElementById('btn-restart').classList.remove('hidden');
            }, 500);
        }
    }
};

document.addEventListener('viewChanged', (e) => {
    if (e.detail.viewId === 'view-creatures') {
        CreaturesGame.currentIndex = 0;
        CreaturesGame.reset();
    }
});
