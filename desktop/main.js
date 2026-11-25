const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const fs = require('fs'), path = require('path');

// Portable: Daten neben der .exe (PORTABLE_EXECUTABLE_DIR). Fallback: Benutzerordner.
const baseDir = process.env.PORTABLE_EXECUTABLE_DIR || (app.isPackaged ? path.dirname(process.execPath) : __dirname);
let dataDir = path.join(baseDir, 'daten');
try { fs.mkdirSync(dataDir, { recursive: true }); fs.accessSync(dataDir, fs.constants.W_OK); }
catch (e) { dataDir = path.join(app.getPath('userData'), 'daten'); fs.mkdirSync(dataDir, { recursive: true }); }
const FILE = path.join(dataDir, 'strichliste.json');
const BAK = path.join(dataDir, 'strichliste.bak.json');
const TMP = FILE + '.tmp';

if (!app.requestSingleInstanceLock()) app.quit();

ipcMain.handle('load', () => {
  for (const f of [FILE, BAK]) { try { return fs.readFileSync(f, 'utf8'); } catch (e) {} }
  return null;
});
ipcMain.on('save', (_e, json) => {
  try {
    if (typeof json !== 'string' || json.length < 2) return;
    fs.writeFileSync(TMP, json);                         // erst komplett schreiben
    if (fs.existsSync(FILE)) fs.copyFileSync(FILE, BAK); // vorherigen Stand als Kopie behalten
    fs.renameSync(TMP, FILE);                            // dann atomar ersetzen
  } catch (e) { console.error('Speichern fehlgeschlagen', e); }
});
ipcMain.on('path', e => { e.returnValue = FILE; });

function createWindow() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1100, height: 800, minWidth: 420, title: 'Strichliste', backgroundColor: '#ecebe0', autoHideMenuBar: true,
    icon: path.join(__dirname, 'app', 'icons', 'icon-512.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}
app.whenReady().then(createWindow);
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
