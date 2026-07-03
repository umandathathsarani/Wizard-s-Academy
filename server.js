const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const leaderboardPath = path.join(__dirname, 'data', 'leaderboard.json');

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
            coins: 100 // Starting bonus
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
            
            writeUsers(users, (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ success: true, user: users[userIndex] });
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
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
