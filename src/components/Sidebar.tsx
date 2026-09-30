import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ClipboardList, Wallet, Settings, Snowflake } from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/log', label: 'Daily Log', icon: ClipboardList, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/expenses', label: 'Money', icon: Wallet, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export function Sidebar() {
  return (
    <aside
      className="w-56 shrink-0 border-r flex flex-col gap-1 p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2 px-2 mb-6">
        <Snowflake size={20} style={{ color: 'var(--color-accent)' }} />
        <span className="font-semibold tracking-wide text-sm">WINTER ARC</span>
      </div>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive ? 'font-medium' : ''
            }`
          }
          style={({ isActive }) => ({
            background: isActive ? 'var(--color-accent-soft)' : 'transparent',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          })}
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
