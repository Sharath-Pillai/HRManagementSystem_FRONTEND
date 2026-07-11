import { useState, useEffect } from 'react'
import { Plus, Star, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type={readOnly ? 'button' : 'button'} onClick={() => !readOnly && onChange(s)}
        className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}>
        <Star size={18} className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
      </button>
    ))}
  </div>
)

const Performance = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ employee: '', reviewPeriod: '', rating: 3, comments: '', goals: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/performance')
      setReviews(data.data)
    } catch { toast.error('Failed to load reviews') }
    finally { setLoading(false) }
  }
  useEffect(() => {
    fetchData()
    api.get('/employees?limit=100').then(r => setEmployees(r.data.data.employees)).catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/performance', form)
      toast.success('Review submitted!')
      setModal(false)
      setForm({ employee: '', reviewPeriod: '', rating: 3, comments: '', goals: '' })
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const columns = [
    { header: 'Employee', render: r => `${r.employee?.firstName} ${r.employee?.lastName}` },
    { header: 'Reviewer', render: r => r.reviewer?.name },
    { header: 'Period', accessor: 'reviewPeriod', sortable: true },
    { header: 'Rating', render: r => <StarRating value={r.rating} readOnly /> },
    { header: 'Status', render: r => <span className={`badge ${r.status === 'submitted' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span> },
    { header: 'Comments', render: r => <span className="text-slate-400 text-xs max-w-xs truncate">{r.comments}</span> },
    { header: 'Date', render: r => format(new Date(r.createdAt), 'dd MMM yyyy') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Performance Reviews</h1>
          <p className="text-slate-500 text-sm">Track employee KPIs and ratings</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Add Review</button>
      </div>
      <DataTable columns={columns} data={reviews} loading={loading} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Performance Review" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="input-label">Employee *</label>
            <select value={form.employee} onChange={e => set('employee', e.target.value)} className="select" required>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Review Period * (e.g. Q1 2025)</label>
            <input value={form.reviewPeriod} onChange={e => set('reviewPeriod', e.target.value)} className="input" placeholder="Q1 2025" required />
          </div>
          <div>
            <label className="input-label">Rating *</label>
            <div className="flex items-center gap-3">
              <StarRating value={form.rating} onChange={v => set('rating', v)} />
              <span className="text-slate-400 text-sm">{form.rating}/5</span>
            </div>
          </div>
          <div><label className="input-label">Comments</label><textarea value={form.comments} onChange={e => set('comments', e.target.value)} className="input resize-none h-20" placeholder="Performance feedback..." /></div>
          <div><label className="input-label">Goals for Next Period</label><textarea value={form.goals} onChange={e => set('goals', e.target.value)} className="input resize-none h-20" placeholder="Set goals..." /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Performance
