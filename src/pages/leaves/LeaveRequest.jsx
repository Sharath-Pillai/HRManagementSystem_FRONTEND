import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const LEAVE_TYPES = ['sick', 'casual', 'paid', 'maternity', 'paternity']

const LeaveRequest = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date must be after start date')
    setLoading(true)
    try {
      await api.post('/leaves/apply', form)
      toast.success('Leave application submitted!')
      navigate('/leaves')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally { setLoading(false) }
  }

  const days = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000*60*60*24)) + 1)
    : 0

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Apply for Leave</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="input-label">Leave Type *</label>
          <select value={form.leaveType} onChange={e => set('leaveType', e.target.value)} className="select" required>
            <option value="">Select leave type</option>
            {LEAVE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Start Date *</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              className="input" required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="input-label">End Date *</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
              className="input" required min={form.startDate || new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        {days > 0 && (
          <div className="px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm text-primary-300">
            📅 Duration: <strong>{days} day{days > 1 ? 's' : ''}</strong>
          </div>
        )}
        <div>
          <label className="input-label">Reason *</label>
          <textarea value={form.reason} onChange={e => set('reason', e.target.value)}
            className="input resize-none h-24" placeholder="Describe the reason for leave..." required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeaveRequest
