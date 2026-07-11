import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

const SalarySlip = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef()

  useEffect(() => {
    api.get(`/payroll/${id}`)
      .then(r => setPayroll(r.data.data))
      .catch(() => { toast.error('Not found'); navigate('/payroll') })
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>
  if (!payroll) return null

  const emp = payroll.employee
  const period = `${MONTH_NAMES[payroll.month - 1]} ${payroll.year}`

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl"><ArrowLeft size={18} /></button>
          <h1 className="page-title">Salary Slip</h1>
        </div>
        <button onClick={handlePrint} className="btn-secondary">
          <Printer size={16} /> Print / PDF
        </button>
      </div>

      {/* Slip */}
      <div ref={printRef} className="card p-8 print:shadow-none print:border-0 print:bg-white print:text-black">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-white text-lg">HRMS Pro</span>
            </div>
            <p className="text-slate-500 text-xs">Human Resource Management System</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">Salary Slip</p>
            <p className="text-primary-400 text-sm">{period}</p>
            <span className={`badge mt-1 ${payroll.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{payroll.status}</span>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-dark-700/50">
          <div><p className="text-xs text-slate-500">Employee Name</p><p className="text-white font-medium">{emp?.firstName} {emp?.lastName}</p></div>
          <div><p className="text-xs text-slate-500">Employee ID</p><p className="text-white font-medium">{emp?.employeeId}</p></div>
          <div><p className="text-xs text-slate-500">Department</p><p className="text-white font-medium">{emp?.department?.name || '—'}</p></div>
          <div><p className="text-xs text-slate-500">Designation</p><p className="text-white font-medium">{emp?.designation?.title || '—'}</p></div>
          {payroll.paidAt && <div><p className="text-xs text-slate-500">Payment Date</p><p className="text-white font-medium">{format(new Date(payroll.paidAt), 'dd MMM yyyy')}</p></div>}
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-emerald-400 font-semibold text-sm mb-3">EARNINGS</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Basic Salary</span><span className="text-white">₹{payroll.basicSalary?.toLocaleString()}</span></div>
              {payroll.bonus > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Bonus</span><span className="text-emerald-400">+₹{payroll.bonus?.toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2"><span className="text-slate-300">Gross</span><span className="text-white">₹{(payroll.basicSalary + payroll.bonus)?.toLocaleString()}</span></div>
            </div>
          </div>
          <div>
            <h3 className="text-red-400 font-semibold text-sm mb-3">DEDUCTIONS</h3>
            <div className="space-y-2">
              {payroll.deductions?.tax > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Income Tax</span><span className="text-red-400">-₹{payroll.deductions.tax?.toLocaleString()}</span></div>}
              {payroll.deductions?.insurance > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Insurance</span><span className="text-red-400">-₹{payroll.deductions.insurance?.toLocaleString()}</span></div>}
              {payroll.deductions?.other > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Other</span><span className="text-red-400">-₹{payroll.deductions.other?.toLocaleString()}</span></div>}
              <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2"><span className="text-slate-300">Total Deductions</span><span className="text-red-400">-₹{payroll.totalDeductions?.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-primary shadow-glow">
          <span className="text-white/80 font-medium">NET SALARY</span>
          <span className="text-white text-2xl font-bold">₹{payroll.netSalary?.toLocaleString()}</span>
        </div>

        {payroll.notes && <p className="text-slate-500 text-xs mt-4 text-center italic">Note: {payroll.notes}</p>}
        <p className="text-slate-600 text-xs mt-4 text-center">This is a computer-generated salary slip and does not require a signature.</p>
      </div>
    </div>
  )
}

export default SalarySlip
