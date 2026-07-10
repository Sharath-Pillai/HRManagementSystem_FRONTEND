import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, FileText, DollarSign, Briefcase } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [growth, setGrowth] = useState([])
  const [deptDist, setDeptDist] = useState([])
  const [attendTrend, setAttendTrend] = useState([])
  const [leaveStats, setLeaveStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const isHrOrAdmin = ['superadmin', 'hr', 'manager'].includes(user?.role)
        const requests = [api.get('/dashboard/stats')]
        if (isHrOrAdmin) {
          requests.push(
            api.get('/dashboard/employee-growth'),
            api.get('/dashboard/department-distribution'),
            api.get('/dashboard/attendance-trend'),
            api.get('/dashboard/leave-stats')
          )
        }
        const results = await Promise.all(requests)
        setStats(results[0].data.data)
        if (isHrOrAdmin) {
          const rawGrowth = results[1].data.data
          setGrowth(rawGrowth.map(d => ({ month: MONTH_NAMES[d._id.month - 1], count: d.count })))
          setDeptDist(results[2].data.data)
          // Process attendance trend
          const trendMap = {}
          results[3].data.data.forEach(({ _id, count }) => {
            const dateKey = new Date(_id.date).toLocaleDateString('en-IN', { weekday: 'short' })
            if (!trendMap[dateKey]) trendMap[dateKey] = { date: dateKey }
            trendMap[dateKey][_id.status] = count
          })
          setAttendTrend(Object.values(trendMap))
          setLeaveStats(results[4].data.data.map(d => ({ name: d._id, value: d.count })))
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAll()
  }, [user])

  const isHrOrAdmin = ['superadmin', 'hr', 'manager'].includes(user?.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, <span className="text-primary-400 font-medium">{user?.name?.split(' ')[0]}</span> 👋
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-24 animate-pulse bg-dark-700/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <StatCard title="Total Employees" value={stats?.totalEmployees ?? 0} icon={Users} color="primary" />
          <StatCard title="Present Today" value={stats?.presentToday ?? 0} icon={UserCheck} color="emerald" />
          <StatCard title="Absent Today" value={stats?.absentToday ?? 0} icon={UserX} color="red" />
          <StatCard title="Pending Leaves" value={stats?.pendingLeaves ?? 0} icon={FileText} color="amber" />
          <StatCard title="Payroll This Month" value={`₹${((stats?.payrollThisMonth ?? 0)/100000).toFixed(1)}L`} icon={DollarSign} color="blue" />
          <StatCard title="Open Positions" value={stats?.openJobs ?? 0} icon={Briefcase} color="purple" />
        </div>
      )}

      {/* Charts — only for hr/admin/manager */}
      {isHrOrAdmin && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Growth */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Employee Growth</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="New Hires" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Trend */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Attendance Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4,4,0,0]} />
                <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4,4,0,0]} />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptDist} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {deptDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Statistics */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Leave Statistics</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaveStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0,4,4,0]} name="Count">
                  {leaveStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
