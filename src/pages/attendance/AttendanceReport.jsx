import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'

const COLORS = ['#22c55e','#f59e0b','#ef4444','#6366f1']

const AttendanceReport = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/attendance/report?month=${month}&year=${year}`)
      setReport(data.data)
    } catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchReport() }, [month, year])

  const chartData = report.map(r => ({
    name: `${r.employee?.firstName} ${r.employee?.lastName}`,
    present: r.present, late: r.late, absent: r.absent, halfDay: r.halfDay,
  }))

  const columns = [
    { header: 'Employee', render: r => `${r.employee?.firstName} ${r.employee?.lastName}` },
    { header: 'Employee ID', render: r => r.employee?.employeeId },
    { header: 'Present', accessor: 'present', render: r => <span className="text-emerald-400 font-semibold">{r.present}</span> },
    { header: 'Late', accessor: 'late', render: r => <span className="text-amber-400 font-semibold">{r.late}</span> },
    { header: 'Half Day', accessor: 'halfDay', render: r => <span className="text-blue-400 font-semibold">{r.halfDay}</span> },
    { header: 'Absent', accessor: 'absent', render: r => <span className="text-red-400 font-semibold">{r.absent}</span> },
    { header: 'Total Hours', render: r => <span className="text-white font-medium">{r.totalHours?.toFixed(1)}h</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance Report</h1>
          <p className="text-slate-500 text-sm">Monthly summary for all employees</p>
        </div>
        <div className="flex gap-3">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="select py-2 text-sm w-36">
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="select py-2 text-sm w-28">
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="section-title mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1e1e35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12 }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4,4,0,0]} />
              <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4,4,0,0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4,4,0,0]} />
              <Bar dataKey="halfDay" fill="#6366f1" name="Half Day" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <DataTable columns={columns} data={report} loading={loading} searchable={false} />
    </div>
  )
}

export default AttendanceReport
