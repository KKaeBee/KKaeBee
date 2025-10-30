const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.platform === 'win32') app.setAppUserModelId('com.KKaeBee');

function prepareDbPath() {
    const packagedInDb = path.join(process.resourcesPath || __dirname, 'db', 'app.db');
    const packagedRoot = path.join(process.resourcesPath || __dirname, 'app.db');

    const devSrc = path.join(__dirname, 'db', 'app.db');

    const candidates = [packagedInDb, packagedRoot, devSrc];
    const src = candidates.find(p => fs.existsSync(p));
    if (!src) {
        console.error('Cannot find app.db in:', candidates);
        return devSrc;
    }

    const userDbDir = path.join(app.getPath('userData'), 'db');
    const dst = path.join(userDbDir, 'app.db');
    fs.mkdirSync(userDbDir, { recursive: true });
    if (!fs.existsSync(dst)) {
        try { fs.copyFileSync(src, dst); } catch (e) { console.error('DB copy failed:', e); }
    }
    return dst;
}

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1280,
        minHeight: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, sandbox: true
        }
    });
    win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(() => {
    // DB 경로 준비 후 환경변수로 주입
    const dbPath = prepareDbPath();
    process.env.DB_PATH = dbPath;

    require('./app');

    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});