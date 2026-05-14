const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prices.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if table is empty and insert test data
    db.get('SELECT COUNT(*) as count FROM prices', (err, row) => {
        if (err) {
            console.error('Error checking table:', err.message);
            return;
        }
        
        if (row.count === 0) {
            console.log('Inserting test data...');
            const testData = [
                { date: '2026-05-01', name: '紐約客牛排', price: 880 },
                { date: '2026-05-05', name: '紐約客牛排', price: 890 },
                { date: '2026-05-10', name: '紐約客牛排', price: 870 },
                { date: '2026-05-01', name: '肋眼牛排', price: 680 },
                { date: '2026-05-05', name: '肋眼牛排', price: 700 },
                { date: '2026-05-10', name: '肋眼牛排', price: 690 },
                { date: '2026-05-01', name: '菲力牛排', price: 950 },
                { date: '2026-05-05', name: '菲力牛排', price: 960 },
                { date: '2026-05-10', name: '菲力牛排', price: 940 }
            ];

            const stmt = db.prepare('INSERT INTO prices (date, name, price) VALUES (?, ?, ?)');
            testData.forEach(data => {
                stmt.run(data.date, data.name, data.price);
            });
            stmt.finalize();
        }
    });
});

module.exports = db;
