const { Client } = require('pg');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
        auto_clicks INTEGER DEFAULT 0,
        timestamp TIMESTAMPTZ
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.stack);
    } else {
        console.log('Table created or verified successfully.');
    }
});

// Добавление поля `timestamp`, если таблица уже существует и поле отсутствует
client.query(`
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name='players' AND column_name='timestamp'
        ) THEN
            ALTER TABLE players
            ADD COLUMN timestamp TIMESTAMPTZ;
        END IF;
    END
    $$;
`, (err) => {
    if (err) {
        console.error('Error adding timestamp column:', err.stack);
    } else {
        console.log('Timestamp column added successfully.');
    }
});

// Обслуживание статических файлов из директории dist
app.use(express.static(path.join(__dirname, '../dist')));
// Поддержка обработки json запросов
app.use(express.json());

app.get('/api/clicks', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    client.query("SELECT clicks, auto_clicks, timestamp FROM players WHERE userId = $1", [userId], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.rows.length === 0) {
            return res.json({ clicks: 0, auto_clicks: 0 });
        }

        const row = result.rows[0];
        res.json({ clicks: row.clicks, auto_clicks: row.auto_clicks, timestamp: row.timestamp });
    });
});

app.post('/api/clicks', (req, res) => {
    const { userId, username, clicks } = req.body;
    if (!userId || clicks === undefined || !username) {
        return res.status(400).json({ error: 'User ID, username, and clicks are required' });
    }
    client.query(
        "INSERT INTO players (userId, username, clicks, timestamp) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT(userId) DO UPDATE SET clicks = EXCLUDED.clicks, timestamp = CURRENT_TIMESTAMP",
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
        1: { cost: 10, auto_clicks: 10000 },
        2: { cost: 100, auto_clicks: 50000 },
        3: { cost: 1000, auto_clicks: 150000 },
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
    const limit = 20;
    client.query("SELECT username, auto_clicks FROM players LIMIT $1", [limit], (err, result) => {
        if (err) {
            console.error('Error fetching top players:', err.stack);
            return res.status(500).json({ error: 'Database error' });
        }
        // Применяем calculateClicks к каждому игроку
        const playersWithUpdatedClicks = result.rows.map(row => ({
            username: row.username,
            clicks: row.auto_clicks
        }));

        playersWithUpdatedClicks.sort((a, b) => b.clicks - a.clicks);

        res.json({ players: playersWithUpdatedClicks });
    });
});

app.listen(PORT, () => {
    console.log(`HTTPS server running on port ${PORT}`);
});

module.exports = app;