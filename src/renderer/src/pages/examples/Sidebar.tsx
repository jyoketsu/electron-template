import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/examples/ipc-renderer', label: '在进程之间通信' },
  { to: '/examples/components', label: '组件示例' },
  { to: '/examples/choose-image', label: '选择图片示例' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 h-full bg-gray-100 overflow-auto">

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center p-3 transition-colors text-gray-600 border-b border-b-gray-200 cursor-default',
              isActive ? 'text-white bg-primary': ''
            )
          }
        >
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  )
}
