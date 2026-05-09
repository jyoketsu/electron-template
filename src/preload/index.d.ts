import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    test: {
      ping: () => Promise<string>
    }
    electron: ElectronAPI
    api: {
      openDirectory: () => Promise<string | null>
      generateImage: (params: unknown) => Promise<{ ok: boolean; data?: unknown; error?: string }>
      saveImage: (b64: string, outputDir: string) => Promise<string>
      historyList: () => Promise<unknown[]>
      historyAdd: (record: unknown) => Promise<void>
      historyDelete: (id: string) => Promise<void>
      showInFolder: (filePath: string) => Promise<void>
    }
  }
}
