const express = require('express');
const app = express();
const port = 3000;
const db = require('./database');
const { scrapeAndSave } = require('./scraper');

app.use(express.json());
app.use(express.static('public'));

// API to get prices
app.get('/api/prices', (req, res) => {
    const { name } = req.query;
    let sql = 'SELECT * FROM prices ORDER BY date DESC';
    const params = [];
    if (name) {
        sql = 'SELECT * FROM prices WHERE name LIKE ? ORDER BY date DESC';
        params.push(`%${name}%`);
    }
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// API to trigger scraper
app.post('/api/scrape', (req, res) => {
    scrapeAndSave()
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.error('Scraper error:', error.message);
            res.status(500).json({ "error": error.message || "爬取失敗" });
        });
});

// API to add a new price
app.post('/api/prices', (req, res) => {
    const { date, name, price } = req.body;
    if (!date || !name || !price) {
        res.status(400).json({ "error": "Please provide date, name, and price." });
        return;
    }
    const sql = 'INSERT INTO prices (date, name, price) VALUES (?, ?, ?)';
    const params = [date, name, price];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, date, name, price }
        });
    });
});

// Global error handling middleware - must be after all other middleware and routes
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ "error": err.message || "伺服器發生錯誤" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});