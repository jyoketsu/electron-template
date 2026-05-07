import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import electronLogo from '@/assets/tech-stack/electron.svg'
import { HouseIcon, SquareChartGanttIcon, SettingsIcon } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: HouseIcon, exact: true },
  { to: '/examples/components', label: '示例', icon: SquareChartGanttIcon, activePrefix: '/examples' },
  { to: '/settings', label: '设置', icon: SettingsIcon },
]

export function Sidebar() {
  const location = useLocation()
  return (
    <aside className="w-18 shrink-0 flex flex-col items-center gap-6 bg-[#1B1C26] py-5">
      <img src={electronLogo} className="w-12 h-12 rounded-xl" alt="icon" />

      {NAV_ITEMS.map((item) => {
        // 有 activePrefix 时，只要当前路径以该前缀开头就高亮（如 /examples 下的所有子路由）
        const isActive = item.activePrefix
          ? location.pathname.startsWith(item.activePrefix)
          : item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-1 transition-colors text-gray-400 cursor-default',
              isActive ? 'text-primary-text' : ''
            )}
          >
            <item.icon className="size-7" />
            <span className="text-xs font-semibold">{item.label}</span>
          </NavLink>
        )
      })}
    </aside>
  )
}
