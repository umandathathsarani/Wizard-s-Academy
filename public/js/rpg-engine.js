// rpg-engine.js
const RPGEngine = {
    currentUser: null,
    
    init: function() {
        // Check if user session exists in local storage
        const userId = localStorage.getItem('wizard_id');
        if (userId) {
            this.loadUser(userId);
        } else {
            this.updateUI();
        }
    },
    
    registerUser: async function(username, house) {
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, house })
            });
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('wizard_id', this.currentUser.id);
                this.updateUI();
                return true;
            }
        } catch (e) {
            console.error('Registration failed:', e);
        }
        return false;
    },
    
    loadUser: async function(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`);
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                this.updateUI();
            } else {
                localStorage.removeItem('wizard_id');
            }
        } catch (e) {
            console.error('Failed to load user:', e);
        }
    },
    
    addXP: async function(amount) {
        if (!this.currentUser) return;
        
        let newXp = this.currentUser.xp + amount;
        let newLevel = this.currentUser.level;
        
        // Simple level curve: (Level * 100) XP to reach next level
        let xpNeeded = newLevel * 100;
        
        while (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel++;
            xpNeeded = newLevel * 100;
            this.showLevelUp(newLevel);
        }
        
        this.currentUser.xp = newXp;
        this.currentUser.level = newLevel;
        await this.syncWithServer();
    },
    
    addCoins: async function(amount) {
        if (!this.currentUser) return;
        this.currentUser.coins += amount;
        await this.syncWithServer();
    },
    
    syncWithServer: async function() {
        if (!this.currentUser) return;
        try {
            await fetch(`/api/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    xp: this.currentUser.xp,
                    coins: this.currentUser.coins,
                    level: this.currentUser.level
                })
            });
            this.updateUI();
        } catch (e) {
            console.error('Sync failed:', e);
        }
    },
    
    updateUI: function() {
        // Will be called when user loads/changes
        const profileLink = document.getElementById('nav-profile-link');
        const loginLink = document.getElementById('nav-login-link');
        
        if (this.currentUser) {
            if (loginLink) loginLink.style.display = 'none';
            if (profileLink) {
                profileLink.style.display = 'inline-block';
                profileLink.innerHTML = `${this.currentUser.username.toUpperCase()} <span class="nav-stats">Lvl ${this.currentUser.level} | 🪙 ${this.currentUser.coins}</span>`;
            }
        } else {
            if (loginLink) loginLink.style.display = 'inline-block';
            if (profileLink) profileLink.style.display = 'none';
        }
    },
    
    showLevelUp: function(newLevel) {
        // Display cinematic level up modal
        const modal = document.createElement('div');
        modal.className = 'level-up-modal gs-reveal';
        modal.innerHTML = `
            <h2>LEVEL UP!</h2>
            <p>You are now a Level ${newLevel} Wizard!</p>
            <button class="magical-btn-small" onclick="this.parentElement.remove()">Continue</button>
        `;
        document.body.appendChild(modal);
        
        // CSS injected here for convenience or we can put it in global.css
        if(!document.getElementById('level-up-styles')) {
            const style = document.createElement('style');
            style.id = 'level-up-styles';
            style.textContent = `
                .level-up-modal {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(10, 10, 20, 0.95);
                    border: 2px solid var(--accent-color);
                    padding: 3rem; border-radius: 15px;
                    z-index: 9999; text-align: center;
                    box-shadow: 0 0 50px rgba(212, 175, 55, 0.5);
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .level-up-modal h2 { font-family: var(--font-heading); font-size: 3rem; color: var(--accent-light); margin-bottom: 1rem; }
                .level-up-modal p { font-family: var(--font-body); font-size: 1.5rem; margin-bottom: 2rem; color: #fff; }
            `;
            document.head.appendChild(style);
        }
    }
};

// Initialize RPG engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    RPGEngine.init();
});

// --- Sorting Ceremony Functions ---
function startSorting() {
    const name = document.getElementById('wizard-name').value.trim();
    if (!name) return alert("Please enter your name!");
    document.getElementById('sorting-step-1').style.display = 'none';
    document.getElementById('sorting-step-2').style.display = 'block';
}

async function selectTrait(trait) {
    let house = '';
    if (trait === 'bravery') house = 'gryffindor';
    else if (trait === 'wisdom') house = 'ravenclaw';
    else if (trait === 'ambition') house = 'slytherin';
    else if (trait === 'loyalty') house = 'hufflepuff';
    
    document.getElementById('sorting-step-2').style.display = 'none';
    const name = document.getElementById('wizard-name').value.trim();
    
    // Register user via RPG Engine
    const success = await RPGEngine.registerUser(name, house);
    if (success) {
        document.getElementById('assigned-house').textContent = house.toUpperCase() + "!";
        document.getElementById('assigned-house').className = `glow-text massive-text house-${house}`;
        document.getElementById('sorting-step-3').style.display = 'block';
    } else {
        alert("The hat is confused. Try again.");
        document.getElementById('sorting-step-1').style.display = 'block';
    }
}

function finishSorting() {
    // Reset form for next time just in case
    document.getElementById('wizard-name').value = '';
    document.getElementById('sorting-step-1').style.display = 'block';
    document.getElementById('sorting-step-3').style.display = 'none';
    navigateTo('view-profile');
}

// --- Profile View Functions ---
function updateProfileView() {
    const user = RPGEngine.currentUser;
    if (!user) {
        navigateTo('view-sorting-ceremony');
        return;
    }
    
    document.getElementById('profile-name').textContent = user.username;
    document.getElementById('profile-house').textContent = user.house.toUpperCase();
    document.getElementById('profile-house').className = `profile-house house-${user.house}`;
    
    // Avatar logic based on house
    const avatars = {
        gryffindor: '🦁',
        ravenclaw: '🦅',
        slytherin: '🐍',
        hufflepuff: '🦡'
    };
    document.getElementById('profile-avatar').textContent = avatars[user.house] || '🧙‍♂️';
    
    document.getElementById('profile-level').textContent = user.level;
    document.getElementById('profile-coins').textContent = user.coins;
    
    const xpNeeded = user.level * 100;
    document.getElementById('profile-xp-text').textContent = `${user.xp} / ${xpNeeded} XP`;
    
    const percent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));
    document.getElementById('profile-xp-bar').style.width = `${percent}%`;
}

// Ensure updateProfileView is called when we navigate to profile
// We'll hook into core.js navigateTo if possible, or just override it safely
const rpgOriginalNavigateTo = window.navigateTo;
window.navigateTo = function(viewId) {
    if (rpgOriginalNavigateTo) rpgOriginalNavigateTo(viewId);
    if (viewId === 'view-profile') {
        setTimeout(updateProfileView, 50); // slight delay to ensure HTML is injected
    }
};
