import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const typeIcon = { leave:'📋', payroll:'💰', announcement:'📢', attendance:'🕐', general:'🔔' }

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/notifications?limit=50')
      setNotifications(data.data.notifications)
      setUnreadCount(data.data.unreadCount)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchNotifications() }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({...n, isRead: true})))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch {}
  }

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch {}
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-slate-500 text-sm">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize border ${f === filter ? 'bg-primary-500 text-white border-primary-500' : 'border-white/10 text-slate-400 hover:text-white'}`}>
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n._id} className={`card p-4 flex items-start gap-4 transition-all duration-200 group ${!n.isRead ? 'border-primary-500/20 bg-primary-500/3' : ''}`}>
              <div className="text-2xl flex-shrink-0">{typeIcon[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5 animate-pulse-soft" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-emerald-400" title="Mark read">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => deleteNotif(n._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
