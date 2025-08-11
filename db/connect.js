const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 경로 설정
function pickDbPath() {
    const candidates = [
        process.env.DB_PATH,
        path.join(process.resourcesPath || __dirname, 'db', 'app.db'),
        path.join(process.resourcesPath || __dirname, 'app.db'),
        path.join(__dirname, 'app.db'),
    ].filter(Boolean);

    for (const p of candidates) {
        try { if (p && fs.existsSync(p)) return p; } catch { }
    }
    // 개발용 기본 경로
    return path.join(__dirname, 'app.db');
}

const dbFile = pickDbPath();

const db = new sqlite3.Database(
    dbFile,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
);

module.exports = db;
