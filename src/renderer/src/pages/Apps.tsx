import { useNavigate } from 'react-router-dom'

const APP_LIST = [
  { id: 'outfit-swap', title: '换衣服', desc: '上传衣服和人物图片，自动完成换装' },
]

export default function Apps() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">应用</h1>
      <p className="text-sm text-stone-500 mb-6">预构图像工作流，开箱即用。</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
        {APP_LIST.map((app) => (
          <div key={app.id}
            className="bg-white border border-stone-200 rounded-xl p-5 cursor-pointer hover:border-stone-400 transition-colors flex flex-col gap-2"
            onClick={() => navigate(`/apps/${app.id}`)}>
            <div className="text-sm font-semibold text-stone-800">{app.title}</div>
            <div className="text-xs text-stone-400">{app.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
