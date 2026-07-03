const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const leaderboardPath = path.join(__dirname, 'data', 'leaderboard.json');
const itemsPath = path.join(__dirname, 'data', 'items.json');

// GET items catalog
app.get('/api/items', (req, res) => {
    fs.readFile(itemsPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read items data' });
        try {
            res.json(JSON.parse(data));
        } catch(e) {
            res.json([]);
        }
    });
});

// GET leaderboard
app.get('/api/leaderboard', (req, res) => {
    fs.readFile(leaderboardPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read leaderboard data' });
        }
        try {
            res.json(JSON.parse(data));
        } catch(e) {
            res.json({});
        }
    });
});

// POST leaderboard
app.post('/api/leaderboard', (req, res) => {
    const { playerName, score, game } = req.body;
    
    if (!playerName || score === undefined || !game) {
        return res.status(400).json({ error: 'Invalid data format' });
    }
    
    fs.readFile(leaderboardPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read leaderboard data' });
        }
        
        let leaderboard = {};
        try {
            leaderboard = JSON.parse(data);
        } catch(e) {}
        
        if (!leaderboard[game]) {
            leaderboard[game] = [];
        }
        
        leaderboard[game].push({ name: playerName, score: score });
        
        // Sort descending
        leaderboard[game].sort((a, b) => b.score - a.score);
        
        // Keep top 10
        leaderboard[game] = leaderboard[game].slice(0, 10);
        
        fs.writeFile(leaderboardPath, JSON.stringify(leaderboard, null, 4), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save leaderboard data' });
            }
            res.json({ success: true, leaderboard: leaderboard[game] });
        });
    });
});

const usersPath = path.join(__dirname, 'data', 'users.json');

// Helper to read users
function readUsers(callback) {
    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err) return callback([]);
        try {
            callback(JSON.parse(data));
        } catch(e) {
            callback([]);
        }
    });
}

// Helper to write users
function writeUsers(users, callback) {
    fs.writeFile(usersPath, JSON.stringify(users, null, 4), callback);
}

// Register new user
app.post('/api/users/register', (req, res) => {
    const { username, house } = req.body;
    if (!username || !house) return res.status(400).json({ error: 'Missing username or house' });
    
    readUsers((users) => {
        const newUser = {
            id: Date.now().toString() + Math.floor(Math.random()*1000).toString(),
            username,
            house,
            level: 1,
            xp: 0,
            coins: 100, // Starting bonus
            inventory: [],
            equipped: { wand: null, pet: null }
        };
        users.push(newUser);
        writeUsers(users, (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save user' });
            res.json({ success: true, user: newUser });
        });
    });
});

// Get user
app.get('/api/users/:id', (req, res) => {
    readUsers((users) => {
        const user = users.find(u => u.id === req.params.id);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Update user (XP, Coins, Level)
app.put('/api/users/:id', (req, res) => {
    const { xp, coins, level } = req.body;
    
    readUsers((users) => {
        const userIndex = users.findIndex(u => u.id === req.params.id);
        if (userIndex !== -1) {
            if (xp !== undefined) users[userIndex].xp = xp;
            if (coins !== undefined) users[userIndex].coins = coins;
            if (level !== undefined) users[userIndex].level = level;
            if (req.body.inventory) users[userIndex].inventory = req.body.inventory;
            if (req.body.equipped) users[userIndex].equipped = req.body.equipped;
            if (req.body.activeQuests) users[userIndex].activeQuests = req.body.activeQuests;
            if (req.body.lastQuestReset !== undefined) users[userIndex].lastQuestReset = req.body.lastQuestReset;
            
            writeUsers(users, (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ success: true, user: users[userIndex] });
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Buy item
app.post('/api/users/:id/buy', (req, res) => {
    const { itemId } = req.body;
    
    fs.readFile(itemsPath, 'utf8', (err, itemData) => {
        if (err) return res.status(500).json({ error: 'Failed to load items' });
        
        let items = [];
        try { items = JSON.parse(itemData); } catch(e) {}
        
        const item = items.find(i => i.id === itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        readUsers((users) => {
            const userIndex = users.findIndex(u => u.id === req.params.id);
            if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
            
            const user = users[userIndex];
            
            // Ensure inventory arrays exist for old users
            if (!user.inventory) user.inventory = [];
            if (!user.equipped) user.equipped = { wand: null, pet: null };
            
            if (user.coins < item.price) {
                return res.status(400).json({ error: 'Not enough Galleons' });
            }
            
            if (item.type !== 'potion' && user.inventory.includes(itemId)) {
                return res.status(400).json({ error: 'Already own this item' });
            }
            
            user.coins -= item.price;
            
            if (item.type !== 'potion') {
                user.inventory.push(itemId);
            } else if (item.instantXp) {
                // Instantly grant XP for potions, no inventory needed
                user.xp += item.instantXp;
            }
            
            writeUsers(users, (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ success: true, user });
            });
        });
    });
});

// Equip item
app.post('/api/users/:id/equip', (req, res) => {
    const { itemId } = req.body;
    
    fs.readFile(itemsPath, 'utf8', (err, itemData) => {
        if (err) return res.status(500).json({ error: 'Failed to load items' });
        
        let items = [];
        try { items = JSON.parse(itemData); } catch(e) {}
        
        const item = items.find(i => i.id === itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        
        readUsers((users) => {
            const userIndex = users.findIndex(u => u.id === req.params.id);
            if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
            
            const user = users[userIndex];
            
            if (!user.inventory || !user.inventory.includes(itemId)) {
                return res.status(400).json({ error: 'You do not own this item' });
            }
            
            if (!user.equipped) user.equipped = { wand: null, pet: null };
            
            // Equip based on type
            if (item.type === 'wand') {
                user.equipped.wand = user.equipped.wand === itemId ? null : itemId;
            }
            if (item.type === 'pet') {
                user.equipped.pet = user.equipped.pet === itemId ? null : itemId;
            }
            
            writeUsers(users, (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ success: true, user });
            });
        });
    });
});

const questsPath = path.join(__dirname, 'data', 'quests.json');

// Get/Reset user quests
app.get('/api/users/:id/quests', (req, res) => {
    readUsers((users) => {
        const userIndex = users.findIndex(u => u.id === req.params.id);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
        
        const user = users[userIndex];
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        fs.readFile(questsPath, 'utf8', (err, questData) => {
            if (err) return res.status(500).json({ error: 'Failed to load quests catalog' });
            
            let allQuests = [];
            try { allQuests = JSON.parse(questData); } catch(e) {}
            
            // Check if we need to assign new quests
            if (!user.lastQuestReset || (now - user.lastQuestReset) > TWENTY_FOUR_HOURS) {
                // Shuffle and pick 3 quests
                const shuffled = allQuests.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3);
                
                user.activeQuests = selected.map(q => ({
                    id: q.id,
                    progress: 0,
                    claimed: false
                }));
                user.lastQuestReset = now;
                
                writeUsers(users, () => {
                    // Ignore write error for now, continue to return data
                });
            }
            
            // Map active quests to full details
            const activeQuestsDetails = (user.activeQuests || []).map(aq => {
                const catalogQuest = allQuests.find(q => q.id === aq.id) || {};
                return { ...catalogQuest, ...aq };
            });
            
            res.json({ success: true, quests: activeQuestsDetails, nextReset: user.lastQuestReset + TWENTY_FOUR_HOURS });
        });
    });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🪄 Wizard's Academy server is running on http://localhost:${PORT}`);
});
