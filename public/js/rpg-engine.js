// rpg-engine.js
const RPGEngine = {
    currentUser: null,
    itemsCatalog: [],
    quests: [], // Currently active quests for the user
    
    init: async function() {
        await this.loadItems();
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
                await this.loadQuests();
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
                await this.loadQuests();
                this.updateUI();
            } else {
                localStorage.removeItem('wizard_id');
            }
        } catch (e) {
            console.error('Failed to load user:', e);
        }
    },
    
    logout: function() {
        this.currentUser = null;
        this.quests = [];
        localStorage.removeItem('wizard_id');
        this.updateUI();
        navigateTo('view-home');
        
        // Show a brief notification
        const banner = document.createElement('div');
        banner.className = 'quest-notification';
        banner.innerHTML = `
            <div class="quest-notif-icon">👋</div>
            <div class="quest-notif-text">
                <h4>Logged Out</h4>
                <p>You are now playing as a Guest.</p>
            </div>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
        setTimeout(() => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    },
    
    loadItems: async function() {
        try {
            const response = await fetch('/api/items');
            this.itemsCatalog = await response.json();
        } catch (e) {
            console.error('Failed to load items catalog:', e);
        }
    },
    
    buyItem: async function(itemId) {
        if (!this.currentUser) return { success: false, error: 'Not logged in' };
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            });
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                this.updateUI();
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    },
    
    equipItem: async function(itemId) {
        if (!this.currentUser) return { success: false, error: 'Not logged in' };
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            });
            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user;
                this.updateUI();
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    },
    
    addXP: async function(amount) {
        if (!this.currentUser) return;
        
        let multiplier = 1.0;
        if (this.currentUser.equipped && this.currentUser.equipped.pet) {
            const petId = this.currentUser.equipped.pet;
            const petItem = this.itemsCatalog.find(i => i.id === petId);
            if (petItem && petItem.xpBoost) {
                multiplier += petItem.xpBoost;
            }
        }
        
        const finalAmount = Math.floor(amount * multiplier);
        
        let newXp = this.currentUser.xp + finalAmount;
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
                    level: this.currentUser.level,
                    activeQuests: this.currentUser.activeQuests
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
            if (loginLink) loginLink.classList.add('hidden');
            if (profileLink) {
                profileLink.classList.remove('hidden');
                profileLink.innerHTML = `${this.currentUser.username.toUpperCase()} <span class="nav-stats">Lvl ${this.currentUser.level} | 🪙 ${this.currentUser.coins}</span>`;
            }
            
            // Apply equipped wand to cursor
            const cursor = document.getElementById('magic-cursor');
            if (cursor && this.currentUser.equipped && this.currentUser.equipped.wand) {
                const wandItem = this.itemsCatalog.find(i => i.id === this.currentUser.equipped.wand);
                if (wandItem) {
                    cursor.textContent = wandItem.icon;
                }
            } else if (cursor) {
                cursor.textContent = '🪄';
            }
        } else {
            if (loginLink) loginLink.classList.remove('hidden');
            if (profileLink) profileLink.classList.add('hidden');
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
    if (!name) return magicalAlert("Please enter your name!");
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
        magicalAlert("The hat is confused. Try again.");
        document.getElementById('sorting-step-1').style.display = 'block';
    }
}

async function loginExistingUser() {
    const name = document.getElementById('wizard-name').value.trim();
    if (!name) return magicalAlert("Please enter your name to log in!");
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name })
        });
        const data = await response.json();
        
        if (data.success) {
            RPGEngine.currentUser = data.user;
            localStorage.setItem('wizard_id', RPGEngine.currentUser.id);
            await RPGEngine.loadQuests();
            RPGEngine.updateUI();
            
            // Navigate straight to profile since they already have a house
            navigateTo('view-profile');
            
            // Notification
            if (typeof clickAudio !== 'undefined' && clickAudio) clickAudio.play().catch(e=>{});
        } else {
            magicalAlert(data.error || "Failed to log in.");
        }
    } catch (e) {
        magicalAlert("Network error.");
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
    
    // Check if user has an equipped pet to show instead of default avatar
    let avatarIcon = avatars[user.house] || '🧙‍♂️';
    if (user.equipped && user.equipped.pet) {
        const petItem = RPGEngine.itemsCatalog.find(i => i.id === user.equipped.pet);
        if (petItem) avatarIcon = petItem.icon;
    }
    document.getElementById('profile-avatar').textContent = avatarIcon;
    
    // Update equipped wand
    const wandSlot = document.getElementById('profile-wand');
    if (wandSlot) {
        if (user.equipped && user.equipped.wand) {
            const wandItem = RPGEngine.itemsCatalog.find(i => i.id === user.equipped.wand);
            if (wandItem) {
                wandSlot.innerHTML = `${wandItem.icon} ${wandItem.name}`;
            }
        } else {
            wandSlot.innerHTML = `🪄 Basic Wood Wand`;
        }
    }
    
    document.getElementById('profile-level').textContent = user.level;
    document.getElementById('profile-coins').textContent = user.coins;
    
    const xpNeeded = user.level * 100;
    document.getElementById('profile-xp-text').textContent = `${user.xp} / ${xpNeeded} XP`;
    
    const percent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));
    document.getElementById('profile-xp-bar').style.width = `${percent}%`;
    
    // Render Quests
    const questsContainer = document.getElementById('quests-container');
    if (questsContainer && RPGEngine.quests) {
        questsContainer.innerHTML = '';
        RPGEngine.quests.forEach(quest => {
            const percentComplete = Math.min(100, Math.floor((quest.progress / quest.targetValue) * 100));
            const isCompleted = quest.progress >= quest.targetValue;
            
            let actionHtml = '';
            if (quest.claimed) {
                actionHtml = `<button class="magical-btn btn-equipped" disabled style="padding: 0.5rem 1rem; font-size: 0.9rem;">Claimed</button>`;
            } else if (isCompleted) {
                actionHtml = `<button class="magical-btn" onclick="RPGEngine.claimQuest('${quest.id}')" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Claim Reward</button>`;
            } else {
                actionHtml = `<div style="font-size: 0.9rem; color: #ccc;">${quest.progress} / ${quest.targetValue}</div>`;
            }
            
            questsContainer.innerHTML += `
                <div style="background: rgba(20,20,30,0.8); border: 1px solid rgba(212,175,55,0.3); border-radius: 10px; padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                    <div style="flex-grow: 1;">
                        <h4 style="color: var(--accent-light); margin-bottom: 0.5rem;">${quest.title}</h4>
                        <p style="font-size: 0.9rem; color: #aaa; margin-bottom: 0.5rem;">${quest.description}</p>
                        <div class="xp-bar-container" style="height: 10px; margin-bottom: 0;">
                            <div class="xp-bar" style="width: ${percentComplete}%; background: ${isCompleted ? 'var(--accent-color)' : ''}"></div>
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <div style="color: var(--accent-color); font-weight: bold; margin-bottom: 0.5rem;">
                            ${quest.rewardXp > 0 ? `+${quest.rewardXp} XP` : ''}
                            ${quest.rewardCoins > 0 ? `+${quest.rewardCoins} Galleons` : ''}
                        </div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        });
    }
}

window.switchProfileTab = function(tab) {
    document.getElementById('profile-content-overview').style.display = 'none';
    document.getElementById('profile-content-quests').style.display = 'none';
    
    document.getElementById('tab-overview').classList.remove('active');
    document.getElementById('tab-quests').classList.remove('active');
    
    document.getElementById(`profile-content-${tab}`).style.display = 'block';
    document.getElementById(`tab-${tab}`).classList.add('active');
};

// --- Quests System ---
RPGEngine.loadQuests = async function() {
    if (!this.currentUser) return;
    try {
        const response = await fetch(`/api/users/${this.currentUser.id}/quests`);
        const data = await response.json();
        if (data.success) {
            this.quests = data.quests;
            this.currentUser.activeQuests = this.quests.map(q => ({
                id: q.id, progress: q.progress, claimed: q.claimed
            }));
        }
    } catch (e) {
        console.error('Failed to load quests:', e);
    }
};

RPGEngine.updateQuestProgress = async function(actionType, value) {
    if (!this.currentUser || !this.quests) return;
    
    let updated = false;
    for (let quest of this.quests) {
        if (quest.actionType === actionType && !quest.claimed && quest.progress < quest.targetValue) {
            quest.progress += value;
            if (quest.progress >= quest.targetValue) {
                quest.progress = quest.targetValue;
                this.showQuestNotification(quest);
            }
            
            // Also update the currentUser object
            const uq = this.currentUser.activeQuests.find(q => q.id === quest.id);
            if (uq) uq.progress = quest.progress;
            updated = true;
        }
    }
    
    if (updated) {
        await this.syncWithServer();
        // Try updating profile view if we are on it
        const currentView = document.querySelector('.view.active');
        if (currentView && currentView.id === 'view-profile') {
            updateProfileView();
        }
    }
};

RPGEngine.claimQuest = async function(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.targetValue) return;
    
    quest.claimed = true;
    const uq = this.currentUser.activeQuests.find(q => q.id === questId);
    if (uq) uq.claimed = true;
    
    await this.addXP(quest.rewardXp);
    if (quest.rewardCoins > 0) {
        await this.addCoins(quest.rewardCoins);
    }
    
    await this.syncWithServer();
    updateProfileView();
};

RPGEngine.showQuestNotification = function(quest) {
    const banner = document.createElement('div');
    banner.className = 'quest-notification';
    banner.innerHTML = `
        <div class="quest-notif-icon">⭐</div>
        <div class="quest-notif-text">
            <h4>Quest Completed!</h4>
            <p>${quest.title}</p>
            <div style="font-size: 0.8rem; margin-top: 0.3rem; color: #ffd700;">
                ${quest.rewardXp > 0 ? `+${quest.rewardXp} XP` : ''}
                ${quest.rewardCoins > 0 ? `+${quest.rewardCoins} Galleons` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(banner);
    
    setTimeout(() => banner.classList.add('show'), 100);
    
    if (typeof clickAudio !== 'undefined' && clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => {});
    }
    
    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 500);
    }, 4000);
};

// --- Shop View Functions ---
function updateShopView() {
    const user = RPGEngine.currentUser;
    if (!user) {
        navigateTo('view-sorting-ceremony');
        return;
    }
    
    document.getElementById('shop-user-coins').textContent = `🪙 ${user.coins}`;
    
    const container = document.getElementById('shop-items-container');
    if (!container) return;
    container.innerHTML = '';
    
    RPGEngine.itemsCatalog.forEach(item => {
        const isOwned = item.type !== 'potion' && user.inventory && user.inventory.includes(item.id);
        const isEquipped = user.equipped && (user.equipped.wand === item.id || user.equipped.pet === item.id);
        
        const isLevelLocked = item.requiredLevel && user.level < item.requiredLevel;
        
        let buttonHtml = `<button class="magical-btn item-action" onclick="handleBuyItem('${item.id}')" ${isLevelLocked ? 'disabled style="filter: grayscale(1); opacity: 0.5; cursor: not-allowed;"' : ''}>
            ${isLevelLocked ? '🔒 Level ' + item.requiredLevel : 'Buy (' + item.price + ' 🪙)'}
        </button>`;
        
        if (isEquipped) {
            buttonHtml = `<button class="magical-btn btn-equipped item-action" onclick="handleEquipItem('${item.id}')">Equipped</button>`;
        } else if (isOwned) {
            buttonHtml = `<button class="magical-btn btn-equip item-action" onclick="handleEquipItem('${item.id}')">Equip</button>`;
        }
        
        const card = document.createElement('div');
        card.className = `shop-item ${isLevelLocked ? 'locked-item' : ''}`;
        card.innerHTML = `
            <div class="item-icon" ${isLevelLocked ? 'style="filter: grayscale(1); opacity: 0.5;"' : ''}>${item.icon}</div>
            <div class="item-name" ${isLevelLocked ? 'style="color: #888;"' : ''}>${item.name}</div>
            <div class="item-type">${item.type}</div>
            <div class="item-desc">${item.description}</div>
            ${!isOwned ? `<div class="item-price" ${isLevelLocked ? 'style="color: #888;"' : ''}>${item.price} 🪙</div>` : ''}
            ${buttonHtml}
        `;
        container.appendChild(card);
    });
}

async function handleBuyItem(itemId) {
    const btn = event.target;
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    const result = await RPGEngine.buyItem(itemId);
    if (result.success) {
        await RPGEngine.updateQuestProgress('buy_item', 1);
        // Potions apply instantly
        const item = RPGEngine.itemsCatalog.find(i => i.id === itemId);
        if (item && item.type === 'potion') {
            RPGEngine.showLevelUp(RPGEngine.currentUser.level); // Just to trigger a visual if we want, or rely on normal updateUI
        }
        updateShopView();
    } else {
        magicalAlert(result.error);
        btn.textContent = 'Buy';
        btn.disabled = false;
    }
}

async function handleEquipItem(itemId) {
    const btn = event.target;
    btn.textContent = 'Equipping...';
    btn.disabled = true;
    
    const result = await RPGEngine.equipItem(itemId);
    if (result.success) {
        updateShopView();
    } else {
        magicalAlert(result.error);
        btn.textContent = 'Equip';
        btn.disabled = false;
    }
}

// Listen for view changes to update UI components dynamically
document.addEventListener('viewChanged', (e) => {
    const viewId = e.detail.viewId;
    if (viewId === 'view-profile') {
        setTimeout(updateProfileView, 50); 
    }
    if (viewId === 'view-diagon-alley') {
        setTimeout(updateShopView, 50);
    }
});
