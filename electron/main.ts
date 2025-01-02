import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { NdiHandler } from './addon'
import fs from 'fs';
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

// 在创建窗口之前添加命令行开关
app.commandLine.appendSwitch('enable-unsafe-swiftshader')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('enable-gpu-rasterization')

let win: BrowserWindow | null
let ndiHandler: NdiHandler | null = new NdiHandler('')

// 设置视频数据接收回调
ndiHandler.on('video', (width: number, height: number, data_buffer: any, data_size: number) => {
  if (!win?.webContents) return;
  
  try {
    if (!data_buffer || data_size !== width * height * 4) {
      console.error('Invalid data buffer received');
      return;
    }

    const receiveTime = performance.now();
    // 检查 data_buffer 的类型并正确创建 Uint8Array

    win.webContents.send('ndi-video-frame', {
      width,
      height,
      data:Buffer.from(data_buffer),
      receiveTime
    });

    // 确保原始缓冲区可以被垃圾回收
    data_buffer = null;
  } catch (e) {
    console.error('Error sending frame:', e)
  }
})

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webgl: true,
    },
  })

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

  // 启动 NDI
  const ndiSourceName = 'ZC-DEVELOP (VLC)' 
  ndiHandler?.start(ndiSourceName)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    ndiHandler = null // 清理 NDI Handler
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow();
})
