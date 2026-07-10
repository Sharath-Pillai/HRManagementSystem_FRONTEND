import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { onNotification, offNotification } from '../utils/socket'
import toast from 'react-hot-toast'
import api from '../api/axios'

const Navbar = ({ onToggleSidebar, onMobileMenuOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropRef = useRef(null)
  const notifRef = useRef(null)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications?limit=5')
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      } catch {}
    }
    fetchNotifications()
  }, [])

  // Real-time notifications
  useEffect(() => {
    const handler = (notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 4)])
      setUnreadCount((prev) => prev + 1)
      toast(notif.title, { icon: '🔔' })
    }
    onNotification(handler)
    return () => offNotification(handler)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/5 px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuOpen} className="btn-ghost p-2 lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <button onClick={onToggleSidebar} className="btn-ghost p-2 hidden lg:flex" aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:flex items-center">
          <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search..."
            className="bg-dark-700/50 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 w-48 lg:w-64 transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn-ghost p-2 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl shadow-card-hover border border-white/10 animate-slide-up overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h3 className="font-semibold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No notifications</p>
                ) : notifications.map((n, i) => (
                  <div key={i} className={`px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.isRead ? 'bg-primary-500/5' : ''}`}>
                    <p className="text-sm text-white font-medium">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5">
                <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-primary-400 hover:text-primary-300 block text-center">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{user?.name?.split(' ')[0]}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl shadow-card-hover border border-white/10 animate-slide-up overflow-hidden">
              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <User size={15} /> Profile
              </Link>
              <Link to="/settings" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                <Settings size={15} /> Settings
              </Link>
              <div className="border-t border-white/5" />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
