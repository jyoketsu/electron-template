import { useTasksStore } from '@/store/tasks'

export default function Tasks() {
  const { tasks } = useTasksStore()

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-stone-800">任务</h1>
        <span className="text-xs text-stone-400">实时任务监控</span>
      </div>
      <p className="text-sm text-stone-500 mb-6">查看进行中的任务，快速扫描进度状态，并在结果完成后重新打开输出。</p>

      {tasks.length === 0 ? (
        <p className="text-sm text-stone-400">当前没有进行中的任务。</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {task.status === 'running' && <span className="text-xs text-stone-400">● 进行中</span>}
                {task.status === 'succeeded' && <span className="text-xs text-green-600">● succeeded</span>}
                {task.status === 'failed' && <span className="text-xs text-red-500">● failed</span>}
                <span className="text-xs text-stone-400 ml-auto">{task.ratio}</span>
              </div>
              <p className="text-sm text-stone-700 line-clamp-2">{task.prompt}</p>
              {task.status === 'running' && (
                <div className="w-full bg-stone-100 rounded-full h-1.5">
                  <div className="bg-[#3d5a3e] h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                </div>
              )}
              {task.error && <p className="text-xs text-red-400">{task.error}</p>}
              <p className="text-xs text-stone-400">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
