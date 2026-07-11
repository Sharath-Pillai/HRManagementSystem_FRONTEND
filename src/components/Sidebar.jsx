import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Building2, CalendarCheck, FileText,
  DollarSign, Briefcase, Star, FolderOpen, Bell, Settings,
  User, ChevronRight, X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard',        roles: ['superadmin','hr','manager','employee'] },
  { label: 'Employees',   icon: Users,           path: '/employees',         roles: ['superadmin','hr','manager'] },
  { label: 'Departments', icon: Building2,       path: '/departments',       roles: ['superadmin','hr'] },
  { label: 'Attendance',  icon: CalendarCheck,   path: '/attendance',        roles: ['superadmin','hr','manager','employee'] },
  { label: 'Leaves',      icon: FileText,        path: '/leaves',            roles: ['superadmin','hr','manager','employee'] },
  { label: 'Payroll',     icon: DollarSign,      path: '/payroll',           roles: ['superadmin','hr','manager','employee'] },
  { label: 'Recruitment', icon: Briefcase,       path: '/recruitment',       roles: ['superadmin','hr'] },
  { label: 'Performance', icon: Star,            path: '/performance',       roles: ['superadmin','hr','manager'] },
  { label: 'Documents',   icon: FolderOpen,      path: '/documents',         roles: ['superadmin','hr'] },
  { label: 'Notifications',icon: Bell,           path: '/notifications',     roles: ['superadmin','hr','manager','employee'] },
  { label: 'Profile',     icon: User,            path: '/profile',           roles: ['superadmin','hr','manager','employee'] },
  { label: 'Settings',    icon: Settings,        path: '/settings',          roles: ['superadmin','hr'] },
]

const Sidebar = ({ open, mobileOpen, onMobileClose }) => {
  const { user } = useAuth()
  const visibleItems = navItems.filter(item => item.roles.includes(user?.role))

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <Users size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-tight">HRMS Pro</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `${isActive ? 'nav-item-active' : 'nav-item'} ${collapsed ? 'justify-center px-3' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-dark-800 border-r border-white/5 z-30 transition-all duration-300 ${open ? 'w-64' : 'w-20'}`}>
        <SidebarContent collapsed={!open} />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden flex flex-col fixed top-0 left-0 h-full w-72 bg-dark-800 border-r border-white/5 z-30 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onMobileClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <SidebarContent collapsed={false} />
      </aside>
    </>
  )
}

export default Sidebar
