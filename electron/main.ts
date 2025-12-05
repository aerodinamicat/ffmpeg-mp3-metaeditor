import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegStatic from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'
import isDev from 'electron-is-dev'

const execFileAsync = promisify(execFile);

// Get binary paths - handle both dev and prod environments
const ffmpegPath = isDev ? ffmpegStatic : path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg').replace('app.asar', 'app.asar.unpacked');
const ffprobePath = isDev ? ffprobeStatic.path : path.join(process.resourcesPath, 'bin', process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe').replace('app.asar', 'app.asar.unpacked');

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    title: 'Editor de Metadatos Multimedia',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 800,
    height: 380,
    center: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Remove application menu
  Menu.setApplicationMenu(null)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// IPC handler for window resize
ipcMain.handle('resize-window', async (_, width: number, height: number) => {
  if (win) {
    win.setSize(width, height, true);
  }
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers - Using direct ffprobe/ffmpeg calls instead of fluent-ffmpeg
ipcMain.handle('read-metadata', async (_, filePath: string) => {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);
    return JSON.parse(stdout);
  } catch (err) {
    console.error('Error reading metadata:', err);
    throw err;
  }
})

ipcMain.handle('write-metadata', async (_, filePath: string, metadata: Record<string, string>) => {
  const ext = path.extname(filePath);
  const tempFile = path.join(os.tmpdir(), `ffmpeg-temp-${Date.now()}${ext}`);
  
  try {
    // Build ffmpeg arguments
    const args = ['-i', filePath, '-c', 'copy'];
    
    // Add metadata options - include empty values to clear fields
    for (const [key, value] of Object.entries(metadata)) {
      // Always add metadata, even if empty (to clear the field)
      args.push('-metadata', `${key}=${value ?? ''}`);
    }
    
    // Output file
    args.push('-y', tempFile);
    
    await execFileAsync(ffmpegPath!, args);
    
    // Replace original with temp file
    fs.copyFileSync(tempFile, filePath);
    fs.unlinkSync(tempFile);
    
    return { success: true };
  } catch (err) {
    console.error('Error writing metadata:', err);
    // Clean up temp file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw err;
  }
})

app.whenReady().then(createWindow)
