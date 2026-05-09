import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const test = {
  ping: () => ipcRenderer.invoke('ping'),
}

const api = {
  openDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:openDirectory'),
  generateImage: (params: unknown): Promise<{ ok: boolean; data?: unknown; error?: string }> =>
    ipcRenderer.invoke('image:generate', params),
  saveImage: (b64: string, outputDir: string): Promise<string> =>
    ipcRenderer.invoke('image:save', { b64, outputDir }),
  historyList: (): Promise<unknown[]> => ipcRenderer.invoke('history:list'),
  historyAdd: (record: unknown): Promise<void> => ipcRenderer.invoke('history:add', record),
  historyDelete: (id: string): Promise<void> => ipcRenderer.invoke('history:delete', id),
  showInFolder: (filePath: string): Promise<void> => ipcRenderer.invoke('shell:showInFolder', filePath),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('test', test)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.test = test
}
