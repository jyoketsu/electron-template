import { create } from 'zustand'
import { TaskRecord, HistoryRecord } from '@/types'

interface GenerateParams {
  apiHost: string
  apiKey: string
  apiMode: string
  prompt: string
  ratio: string
  outputDir: string
  images?: string[]
}

interface TasksState {
  tasks: TaskRecord[]
  addTask: (task: TaskRecord) => void
  updateTask: (id: string, patch: Partial<TaskRecord>) => void
  removeTask: (id: string) => void
  submitGenerate: (params: GenerateParams) => Promise<{ imagePath: string; b64: string } | null>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  submitGenerate: async (params) => {
    const { apiHost, apiKey, apiMode, prompt, ratio, outputDir, images } = params
    const taskId = crypto.randomUUID()
    get().addTask({ id: taskId, createdAt: Date.now(), prompt, ratio, apiMode, progress: 0, status: 'running' })

    const result = await window.api.generateImage({ apiHost, apiKey, apiMode, prompt, size: ratio, images })

    if (!result.ok) {
      get().updateTask(taskId, { status: 'failed', error: result.error as string })
      await window.api.historyAdd({
        id: crypto.randomUUID(), createdAt: Date.now(), prompt,
        status: 'failed', ratio, apiMode, imagePath: '',
      } as HistoryRecord)
      return null
    }

    const data = result.data as any
    let imagePath = ''
    if (data.type === 'b64' && outputDir) {
      imagePath = await window.api.saveImage(data.b64, outputDir)
    }

    get().updateTask(taskId, { status: 'succeeded', progress: 100, imagePath })

    await window.api.historyAdd({
      id: crypto.randomUUID(), createdAt: Date.now(), prompt,
      status: 'succeeded', ratio, apiMode, imagePath,
    } as HistoryRecord)

    return { imagePath, b64: data.b64 ?? '' }
  },
}))
