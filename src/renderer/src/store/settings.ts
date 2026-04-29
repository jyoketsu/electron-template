import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  outputDir: string
  pollInterval: number
  apiHost: string
  apiKey: string
  apiMode: 'grsai' | 'openai'
  setOutputDir: (dir: string) => void
  setPollInterval: (ms: number) => void
  setApiHost: (host: string) => void
  setApiKey: (key: string) => void
  setApiMode: (mode: 'grsai' | 'openai') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      outputDir: '',
      pollInterval: 2500,
      apiHost: 'https://grsai.dakka.com.cn',
      apiKey: '',
      apiMode: 'grsai',
      setOutputDir: (outputDir) => set({ outputDir }),
      setPollInterval: (pollInterval) => set({ pollInterval }),
      setApiHost: (apiHost) => set({ apiHost }),
      setApiKey: (apiKey) => set({ apiKey }),
      setApiMode: (apiMode) => set({ apiMode }),
    }),
    { name: 'electron-template-settings' }
  )
)
