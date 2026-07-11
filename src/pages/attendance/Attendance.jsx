import { useState, useEffect } from 'react'
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import DataTable from '../../components/DataTable'

const statusBadge = (s) => {
  const map = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', 'half-day': 'badge-info', leave: 'badge-purple' }
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
}

const Attendance = () => {
  const { user } = useAuth()
  const [today, setToday] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const isEmployee = user?.role === 'employee'

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/attendance?limit=30')
      setRecords(data.data.records)
      if (isEmployee) {
        const todayRec = data.data.records.find(r =>
          new Date(r.date).toDateString() === new Date().toDateString()
        )
        setToday(todayRec || null)
      }
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  // Live timer when checked in
  useEffect(() => {
    if (!today?.checkIn || today?.checkOut) return
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(today.checkIn)) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [today])

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const { data } = await api.post('/attendance/checkin')
      setToday(data.data)
      setElapsed(0)
      toast.success('Checked in successfully! 🟢')
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed') }
    finally { setActionLoading(false) }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const { data } = await api.post('/attendance/checkout')
      setToday(data.data)
      toast.success(`Checked out! Total: ${data.data.totalHours}h 🔴`)
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed') }
    finally { setActionLoading(false) }
  }

  const columns = [
    { header: 'Date', accessor: 'date', sortable: true, render: r => format(new Date(r.date), 'dd MMM yyyy, EEE') },
    ...(!isEmployee ? [{ header: 'Employee', render: r => `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}` }] : []),
    { header: 'Check In', render: r => r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—' },
    { header: 'Check Out', render: r => r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '—' },
    { header: 'Hours', render: r => r.totalHours ? `${r.totalHours}h` : '—' },
    { header: 'Status', render: r => statusBadge(r.status) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Attendance</h1>
        <p className="text-slate-500 text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Clock-in card for employees */}
      {isEmployee && (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Clock display */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-slate-500 text-sm mb-1">Today's Status</p>
              {today ? (
                <>
                  {statusBadge(today.status)}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    {today.checkIn && <span className="text-slate-300">🟢 In: {format(new Date(today.checkIn), 'hh:mm a')}</span>}
                    {today.checkOut && <span className="text-slate-300">🔴 Out: {format(new Date(today.checkOut), 'hh:mm a')}</span>}
                    {today.totalHours > 0 && <span className="text-emerald-400 font-medium">⏱ {today.totalHours}h worked</span>}
                  </div>
                  {today.checkIn && !today.checkOut && (
                    <div className="mt-2 text-2xl font-mono font-bold text-primary-400 animate-pulse-soft">
                      {formatElapsed(elapsed)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 mt-1">You haven't checked in today</p>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={handleCheckIn} disabled={actionLoading || today?.checkIn}
                className="btn-success px-6 py-3 disabled:opacity-40">
                {actionLoading && !today?.checkIn ? <span className="spinner w-4 h-4" /> : <LogIn size={18} />}
                Check In
              </button>
              <button onClick={handleCheckOut} disabled={actionLoading || !today?.checkIn || today?.checkOut}
                className="btn-danger px-6 py-3 disabled:opacity-40">
                {actionLoading && today?.checkIn ? <span className="spinner w-4 h-4" /> : <LogOut size={18} />}
                Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div>
        <h2 className="section-title mb-4">Recent Attendance</h2>
        <DataTable columns={columns} data={records} loading={loading} />
      </div>
    </div>
  )
}

export default Attendance
