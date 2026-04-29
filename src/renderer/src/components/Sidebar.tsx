import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import icon from '../../../../resources/icon.png'

const NAV_ITEMS = [
  { to: '/', label: '首页', sub: '欢迎来到Electron Template' },
  { to: '/studio', label: '创作台', sub: '自由生成工作区' },
  { to: '/apps', label: '应用', sub: '预构图像工作流' },
  { to: '/tasks', label: '任务', sub: '进行中的任务' },
  { to: '/history', label: '历史', sub: '本地结果归档' },
  { to: '/templates', label: '模板', sub: '提示词配方' },
  { to: '/settings', label: '设置', sub: '偏好设置' },
]

export function Sidebar() {
  return (
    <aside className="w-62 shrink-0 flex flex-col gap-3 bg-stone-100 border-r border-stone-200 p-3 overflow-y-auto">
      <div>
        <div className='flex items-center gap-1'>
          <img src={icon} className="w-8 h-8 rounded-xl mb-2" alt="icon" />
          <div className="text-xl font-bold text-stone-800">Electron Template</div>
        </div>
        <div className="text-xs text-stone-500 mt-1 leading-relaxed">面向商业图像生成与可复用视觉流程的创作工具。</div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
                isActive ? 'bg-[#3d5a3e] text-white' : 'hover:bg-stone-200 text-stone-700'
              )
            }
          >
            <span className="text-sm font-semibold">{item.label}</span>
            <span className="text-xs opacity-70">{item.sub}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-200 pt-3 flex flex-col gap-1">
        <div className="text-xs font-semibold text-stone-500 mb-1">当前状态</div>
        {[['渠道', 'Grsai'], ['主机', 'grsaiapi.com'], ['API', '已连接'], ['版本', '纯本地桌面版']].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs text-stone-500">
            <span>{k}</span>
            <span className={k === 'API' ? 'text-green-600 font-medium' : ''}>{v}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 pt-3">
        <div className="text-xs font-semibold text-stone-500 mb-1">使用说明</div>
        <p className="text-xs text-stone-400 leading-relaxed">当前支持 Grsai 和 OpenAI 官方两套出图渠道，应用、模板、设置和历史都会保存在当前电脑上。</p>
      </div>
    </aside>
  )
}
