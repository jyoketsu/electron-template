export interface HistoryRecord {
  id: string
  createdAt: number
  prompt: string
  status: 'succeeded' | 'failed'
  ratio: string
  apiMode: string
  imagePath: string
  refImagePaths?: string[]
}

export interface TaskRecord {
  id: string
  createdAt: number
  prompt: string
  ratio: string
  apiMode: string
  progress: number
  status: 'running' | 'succeeded' | 'failed'
  error?: string
  imagePath?: string
}
