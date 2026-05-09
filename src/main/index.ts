import { app, shell, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { writeFile, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'

interface HistoryRecord {
  id: string
  createdAt: number
  prompt: string
  status: 'succeeded' | 'failed'
  ratio: string
  apiMode: string
  imagePath: string
  refImagePaths?: string[]
}

function historyFilePath() {
  return join(app.getPath('userData'), 'history.json')
}

async function readHistory(): Promise<HistoryRecord[]> {
  const p = historyFilePath()
  if (!existsSync(p)) return []
  try { return JSON.parse(await readFile(p, 'utf-8')) } catch { return [] }
}

async function writeHistory(records: HistoryRecord[]) {
  await writeFile(historyFilePath(), JSON.stringify(records), 'utf-8')
}

interface GenerateParams {
  apiHost: string
  apiKey: string
  apiMode: 'grsai' | 'openai'
  prompt: string
  size: string
  images?: string[] // base64 data URLs for openai, urls for grsai
}

async function callGrsai(params: GenerateParams) {
  const { apiHost, apiKey, prompt, size, images } = params
  const base = apiHost.replace(/\/$/, '')
  const body = JSON.stringify({
    model: 'gpt-image-2',
    prompt,
    aspectRatio: size,
    ...(images && images.length > 0 ? { urls: images } : {}),
    webHook: '-1', // 立即返回 id，用轮询获取结果
  })
  const res = await fetch(`${base}/v1/draw/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body,
  })
  if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`)
  const json = await res.json()
  // 返回 id 用于轮询
  return { id: json?.data?.id }
}

async function pollGrsaiResult(base: string, apiKey: string, id: string, pollInterval: number): Promise<string> {
  while (true) {
    await new Promise((r) => setTimeout(r, pollInterval))
    const res = await fetch(`${base}/v1/draw/result`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`)
    const json = await res.json()
    const data = json?.data
    if (data?.status === 'succeeded') return data.results?.[0]?.url
    if (data?.status === 'failed') throw new Error(data.failure_reason || data.error || '生成失败')
  }
}

async function callOpenai(params: GenerateParams) {
  const { apiHost, apiKey, prompt, size, images } = params
  const base = apiHost.replace(/\/$/, '')
  if (images && images.length > 0) {
    const form = new globalThis.FormData()
    form.append('model', 'gpt-image-1.5')
    form.append('prompt', prompt)
    if (size !== 'auto') form.append('size', size)
    images.forEach((dataUrl, i) => {
      const [header, b64] = dataUrl.split(',')
      const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
      const buf = Buffer.from(b64, 'base64')
      form.append('image[]', new globalThis.Blob([buf], { type: mime }), `image${i}.png`)
    })
    const res = await fetch(`${base}/v1/images/edits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })
    if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`)
    return res.json()
  } else {
    const res = await fetch(`${base}/v1/images/generations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1.5', prompt, size: size === 'auto' ? undefined : size, n: 1 }),
    })
    if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`)
    return res.json()
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 960,
    height: 800,
    minWidth: 960,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
protocol.registerSchemesAsPrivileged([
  { scheme: 'localfile', privileges: { secure: true, standard: true, supportFetchAPI: true } }
])

app.whenReady().then(() => {
  protocol.registerFileProtocol('localfile', (request, callback) => {
    let filePath = decodeURIComponent(request.url.replace('localfile://', ''))
    // Windows: URL becomes /C:/path after stripping scheme — remove the extra leading slash
    if (filePath.match(/^\/[A-Za-z]:\//)) filePath = filePath.slice(1)
    callback({ path: filePath })
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  /**
   * ipcMain.on vs ipcMain.handle
   * 核心区别：有没有返回值给渲染进程。
   * ipcMain.handle('ping', ...)，对应的渲染进程调用方式应该是 ipcRenderer.invoke('ping')
   * ipcMain.on('ping', ...)，对应的渲染进程调用方式应该是 ipcRenderer.send('ping')
   */
  ipcMain.handle('ping', () => 'pong')

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('history:list', async () => readHistory())

  ipcMain.handle('history:add', async (_e, record: HistoryRecord) => {
    const records = await readHistory()
    records.unshift(record)
    await writeHistory(records)
  })

  ipcMain.handle('history:delete', async (_e, id: string) => {
    const records = await readHistory()
    const target = records.find((r) => r.id === id)
    if (target?.imagePath && existsSync(target.imagePath)) {
      await unlink(target.imagePath).catch(() => { })
    }
    await writeHistory(records.filter((r) => r.id !== id))
  })

  ipcMain.handle('shell:showInFolder', (_e, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('image:generate', async (_event, params: GenerateParams) => {
    try {
      if (params.apiMode === 'grsai') {
        const base = params.apiHost.replace(/\/$/, '')
        const { id } = await callGrsai(params)
        const url = await pollGrsaiResult(base, params.apiKey, id, 2500)
        // 下载图片转为 b64
        const imgRes = await fetch(url)
        const buf = Buffer.from(await imgRes.arrayBuffer())
        const b64 = buf.toString('base64')
        return { ok: true, data: { type: 'b64', b64, url } }
      } else {
        const result = await callOpenai(params)
        return { ok: true, data: { type: 'b64', b64: result?.data?.[0]?.b64_json } }
      }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  })

  ipcMain.handle('image:save', async (_event, { b64, outputDir }: { b64: string; outputDir: string }) => {
    // 兼容完整 data URL（"data:image/png;base64,xxx"）和纯 base64 两种格式
    // 同时从 MIME 类型自动推断文件扩展名（image/jpeg → jpg，image/svg+xml → svg，其余取 / 后的部分）
    let pureB64 = b64
    let ext = 'png'
    if (b64.includes(',')) {
      const header = b64.split(',')[0]           // "data:image/jpeg;base64"
      pureB64 = b64.split(',')[1]
      const mime = header.match(/:(.*?);/)?.[1]  // "image/jpeg"
      const sub = mime?.split('/')?.[1] ?? 'png' // "jpeg" / "svg+xml" / ...
      ext = sub === 'jpeg' ? 'jpg' : sub === 'svg+xml' ? 'svg' : sub
    }
    const filename = `output_${Date.now()}.${ext}`
    const dest = join(outputDir, filename)
    await writeFile(dest, Buffer.from(pureB64, 'base64'))
    return dest
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
