const { Client } = require('pg');
const express = require('express');
const path = require('path');

// Настройка подключения
const client = new Client({
    user: 'postgres',
    host: '35.228.205.53',
    database: 'wombat-kombat',
    password: 'foreveralone',
    port: 5432,
});

client.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to the database successfully.');
    }
});

// Создание таблицы, если не существует
client.query(`
    CREATE TABLE IF NOT EXISTS players (
        userId TEXT PRIMARY KEY,
        username TEXT,
        clicks INTEGER DEFAULT 0,
        auto_clicks INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.stack);
    } else {
        console.log('Table created or verified successfully.');
    }
});

const app = express();

app.use(express.json());

// Обслуживание статических файлов из директории dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/clicks', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    client.query("SELECT clicks, auto_clicks FROM players WHERE userId = $1", [userId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ clicks: result.rows.length ? result.rows[0].clicks : 0, auto_clicks: result.rows.length ? result.rows[0].auto_clicks : 0 });
    });
});

app.post('/api/clicks', (req, res) => {
    const { userId, username, clicks } = req.body;
    if (!userId || clicks === undefined || !username) {
        return res.status(400).json({ error: 'User ID, username, and clicks are required' });
    }
    client.query(
        "INSERT INTO players (userId, username, clicks) VALUES ($1, $2, $3) ON CONFLICT(userId) DO UPDATE SET clicks = EXCLUDED.clicks",
        [userId, username, clicks],
        (err) => {
            if (err) {
                console.error('Error inserting data:', err.stack);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

app.post('/api/upgrade', (req, res) => {
    const { userId, level } = req.body;
    if (!userId || level === undefined) {
        return res.status(400).json({ error: 'User ID and level are required' });
    }

    const upgrades = {
        1: { cost: 10, auto_clicks: 1 },
        2: { cost: 100, auto_clicks: 5 },
        3: { cost: 1000, auto_clicks: 15 },
    };

    const upgrade = upgrades[level];
    if (!upgrade) {
        return res.status(400).json({ error: 'Invalid upgrade level' });
    }

    client.query("SELECT clicks, auto_clicks FROM players WHERE userId = $1", [userId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        if (user.clicks < upgrade.cost) {
            return res.status(400).json({ error: 'Not enough clicks' });
        }

        const newClicks = user.clicks - upgrade.cost;
        const newAutoClicks = user.auto_clicks + upgrade.auto_clicks;

        client.query("UPDATE players SET clicks = $1, auto_clicks = $2 WHERE userId = $3", [newClicks, newAutoClicks, userId], (err) => {
            if (err) {
                console.error('Error updating data:', err.stack);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        });
    });
});

app.get('/api/top-players', (req, res) => {
    const limit = 3;
    client.query("SELECT username, clicks FROM players ORDER BY clicks DESC LIMIT $1", [limit], (err, result) => {
        if (err) {
            console.error('Error fetching top players:', err.stack);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ players: result.rows });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
});
