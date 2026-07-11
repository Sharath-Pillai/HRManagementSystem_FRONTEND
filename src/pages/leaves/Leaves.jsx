import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check, X, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'

const statusBadge = (s) => {
  const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' }
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
}

const Leaves = () => {
  const { user } = useAuth()
  const isHR = ['superadmin','hr','manager'].includes(user?.role)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [rejectModal, setRejectModal] = useState({ open: false, id: null })
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const { data } = await api.get(`/leaves${params}`)
      setLeaves(data.data.leaves)
    } catch { toast.error('Failed to load leaves') }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      await api.put(`/leaves/approve/${id}`)
      toast.success('Leave approved ✅')
      fetchLeaves()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    setActionLoading(true)
    try {
      await api.put(`/leaves/reject/${rejectModal.id}`, { rejectionReason: rejectReason })
      toast.success('Leave rejected')
      setRejectModal({ open: false, id: null })
      setRejectReason('')
      fetchLeaves()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActionLoading(false) }
  }

  const columns = [
    ...(!isHR ? [] : [{ header: 'Employee', render: r => `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}` }]),
    { header: 'Type', render: r => <span className="badge badge-info capitalize">{r.leaveType}</span> },
    { header: 'From', render: r => format(new Date(r.startDate), 'dd MMM yyyy') },
    { header: 'To', render: r => format(new Date(r.endDate), 'dd MMM yyyy') },
    { header: 'Days', accessor: 'totalDays', render: r => <span className="font-semibold text-white">{r.totalDays}</span> },
    { header: 'Reason', render: r => <span className="text-slate-400 text-xs max-w-xs truncate">{r.reason}</span> },
    { header: 'Status', render: r => statusBadge(r.status) },
    ...(isHR ? [{
      header: 'Actions',
      render: (row) => row.status === 'pending' ? (
        <div className="flex gap-1">
          <button onClick={() => handleApprove(row._id)} className="btn-success btn-sm" disabled={actionLoading}>
            <Check size={13} />
          </button>
          <button onClick={() => setRejectModal({ open: true, id: row._id })} className="btn-danger btn-sm" disabled={actionLoading}>
            <X size={13} />
          </button>
        </div>
      ) : <span className="text-slate-600 text-xs">—</span>
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="text-slate-500 text-sm">{isHR ? 'All employee leave requests' : 'Your leave requests'}</p>
        </div>
        <Link to="/leaves/request" id="apply-leave-btn" className="btn-primary">
          <Plus size={16} /> Apply Leave
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize border ${s === statusFilter ? 'bg-primary-500 text-white border-primary-500' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={leaves} loading={loading} searchable={false} />

      {/* Reject modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} title="Reject Leave" size="sm">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Please provide a reason for rejection:</p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            className="input resize-none h-24" placeholder="Enter rejection reason..." />
          <div className="flex gap-3">
            <button onClick={() => setRejectModal({ open: false, id: null })} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleReject} disabled={actionLoading} className="btn-danger flex-1">
              {actionLoading ? 'Rejecting...' : 'Reject Leave'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Leaves
