import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import electronLogo from '@/assets/tech-stack/electron.svg'
import { HouseIcon, SquareChartGanttIcon, SettingsIcon } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: HouseIcon },
  { to: '/examples/components', label: '示例', icon: SquareChartGanttIcon },
  { to: '/settings', label: '设置', icon: SettingsIcon },
]

export function Sidebar() {
  return (
    <aside className="w-18 shrink-0 flex flex-col items-center gap-6 bg-[#1B1C26] py-5">
      <img src={electronLogo} className="w-12 h-12 rounded-xl" alt="icon" />

      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 transition-colors text-gray-400 cursor-default',
              isActive ? 'text-primary-text' : ''
            )
          }
        >
          <item.icon className="size-7" />
          <span className="text-xs font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  )
}
