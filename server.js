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
// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🪄 Wizard's Academy server is running on http://localhost:${PORT}`);
});
