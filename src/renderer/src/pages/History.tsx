import { useEffect, useState } from 'react'
import { HistoryRecord } from '@/types'
import { Button } from '@/components/ui/button'

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>([])

  useEffect(() => {
    window.api.historyList().then((r) => setRecords(r as HistoryRecord[]))
  }, [])

  const handleDelete = async (id: string) => {
    await window.api.historyDelete(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-stone-800">历史</h1>
        <span className="text-xs text-stone-400">本地结果归档</span>
      </div>
      <p className="text-sm text-stone-500 mb-6">把成功和失败任务都保留成本地可回看的作品档案，方便复用提示词、参考图和结果图。</p>

      {records.length === 0 ? (
        <p className="text-sm text-stone-400">暂无历史记录。</p>
      ) : (
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-4">
          {records.map((r) => (
            <div key={r.id} className="break-inside-avoid mb-4 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col">
              {r.imagePath && (
                <img
                  src={`localfile://${r.imagePath.replace(/\\/g, '/')}`}
                  className="w-full object-cover cursor-pointer"
                  onClick={() => window.api.showInFolder(r.imagePath)}
                />
              )}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${r.status === 'succeeded' ? 'text-green-600' : 'text-red-500'}`}>
                    ● {r.status}
                  </span>
                  <span className="text-xs text-stone-400 ml-auto">{r.ratio}</span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-3">{r.prompt}</p>
                <p className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleString()}</p>
                <div className="flex gap-2 mt-1">
                  {r.imagePath && (
                    <Button variant="outline" size="sm" className="text-xs h-7"
                      onClick={() => window.api.showInFolder(r.imagePath)}>
                      打开文件夹
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-xs h-7"
                    onClick={() => handleDelete(r.id)}>
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
