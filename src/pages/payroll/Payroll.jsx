import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Eye, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'

const Payroll = () => {
  const { user } = useAuth()
  const isHR = ['superadmin','hr'].includes(user?.role)
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [genModal, setGenModal] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [genForm, setGenForm] = useState({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), bonus: 0, tax: '', insurance: 0 })

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/payroll')
      setPayrolls(data.data.payrolls)
    } catch { toast.error('Failed to load payroll') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPayrolls() }, [fetchPayrolls])

  useEffect(() => {
    if (isHR) api.get('/employees?limit=100').then(r => setEmployees(r.data.data.employees)).catch(() => {})
  }, [isHR])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenLoading(true)
    try {
      await api.post('/payroll/generate', {
        employeeId: genForm.employeeId,
        month: +genForm.month,
        year: +genForm.year,
        bonus: +genForm.bonus,
        deductions: { tax: genForm.tax !== '' ? +genForm.tax : undefined, insurance: +genForm.insurance },
      })
      toast.success('Payroll generated & notified!')
      setGenModal(false)
      fetchPayrolls()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally { setGenLoading(false) }
  }

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const columns = [
    ...(!isHR ? [] : [{ header: 'Employee', render: r => `${r.employee?.firstName} ${r.employee?.lastName}` }]),
    { header: 'Period', render: r => `${MONTH_NAMES[r.month-1]} ${r.year}` },
    { header: 'Basic Salary', render: r => <span className="text-white font-medium">₹{r.basicSalary?.toLocaleString()}</span> },
    { header: 'Bonus', render: r => <span className="text-emerald-400">+₹{r.bonus?.toLocaleString()}</span> },
    { header: 'Deductions', render: r => <span className="text-red-400">-₹{r.totalDeductions?.toLocaleString()}</span> },
    { header: 'Net Salary', render: r => <span className="text-primary-400 font-bold">₹{r.netSalary?.toLocaleString()}</span> },
    { header: 'Status', render: r => <span className={`badge ${r.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span> },
    { header: 'Action', render: r => <Link to={`/payroll/${r._id}`} className="btn-ghost p-1.5 rounded-lg text-primary-400"><Eye size={15} /></Link> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="text-slate-500 text-sm">{isHR ? 'Manage employee salaries' : 'Your salary history'}</p>
        </div>
        {isHR && (
          <button onClick={() => setGenModal(true)} id="generate-payroll-btn" className="btn-primary">
            <Plus size={16} /> Generate Payroll
          </button>
        )}
      </div>

      <DataTable columns={columns} data={payrolls} loading={loading} />

      {/* Generate Modal */}
      <Modal isOpen={genModal} onClose={() => setGenModal(false)} title="Generate Payroll" size="md">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="input-label">Employee *</label>
            <select value={genForm.employeeId} onChange={e => setGenForm(f=>({...f,employeeId:e.target.value}))} className="select" required>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Month *</label>
              <select value={genForm.month} onChange={e => setGenForm(f=>({...f,month:e.target.value}))} className="select">
                {MONTH_NAMES.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Year *</label>
              <select value={genForm.year} onChange={e => setGenForm(f=>({...f,year:e.target.value}))} className="select">
                {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="input-label">Bonus (₹)</label><input type="number" value={genForm.bonus} onChange={e => setGenForm(f=>({...f,bonus:e.target.value}))} className="input" min="0" /></div>
            <div><label className="input-label">Tax (₹, auto if blank)</label><input type="number" value={genForm.tax} onChange={e => setGenForm(f=>({...f,tax:e.target.value}))} className="input" min="0" placeholder="Auto" /></div>
            <div><label className="input-label">Insurance (₹)</label><input type="number" value={genForm.insurance} onChange={e => setGenForm(f=>({...f,insurance:e.target.value}))} className="input" min="0" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setGenModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={genLoading} className="btn-primary flex-1">
              {genLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : 'Generate & Notify'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Payroll
