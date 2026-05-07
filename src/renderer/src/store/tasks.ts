import { create } from 'zustand'
import { TaskRecord, HistoryRecord } from '@/types'

interface GenerateParams {
  outputDir: string
  images: string[]
}

interface TasksState {
  tasks: TaskRecord[]
  addTask: (task: TaskRecord) => void
  updateTask: (id: string, patch: Partial<TaskRecord>) => void
  removeTask: (id: string) => void
  submitGenerate: (params: GenerateParams) => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  submitGenerate: async (params) => {
    const { outputDir, images } = params;
    for (const element of images) {
      window.api.saveImage(element, outputDir)
    }
  },
}))
