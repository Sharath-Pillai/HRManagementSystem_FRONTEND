import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'
import api from '../../api/axios'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const statusBadge = (status) => {
  const map = { active: 'badge-success', inactive: 'badge-warning', terminated: 'badge-danger' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
}

const Employees = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departments, setDepartments] = useState([])
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null })
  const [deleting, setDeleting] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 })

  const fetchEmployees = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search)       params.set('search', search)
      if (deptFilter)   params.set('department', deptFilter)
      if (statusFilter) params.set('status', statusFilter)
      const { data } = await api.get(`/employees?${params}`)
      setEmployees(data.data.employees)
      setPagination(data.data.pagination)
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [search, deptFilter, statusFilter])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {})
  }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/employees/${deleteModal.employee._id}`)
      toast.success('Employee terminated successfully')
      setDeleteModal({ open: false, employee: null })
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Employee',
      accessor: 'firstName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-white text-sm">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-slate-500">{row.employeeId}</p>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email', sortable: true, render: r => <span className="text-slate-400 text-sm">{r.email}</span> },
    { header: 'Department', accessor: 'department', render: r => <span className="text-slate-300 text-sm">{r.department?.name || '—'}</span> },
    { header: 'Designation', accessor: 'designation', render: r => <span className="text-slate-300 text-sm">{r.designation?.title || '—'}</span> },
    { header: 'Joined', accessor: 'joiningDate', sortable: true, render: r => <span className="text-slate-400 text-sm">{r.joiningDate ? format(new Date(r.joiningDate), 'dd MMM yyyy') : '—'}</span> },
    { header: 'Status', accessor: 'status', render: r => statusBadge(r.status) },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/employees/${row._id}`)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-blue-400" title="View">
            <Eye size={15} />
          </button>
          {['superadmin', 'hr'].includes(user?.role) && (
            <>
              <button onClick={() => navigate(`/employees/${row._id}/edit`)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-amber-400" title="Edit">
                <Pencil size={15} />
              </button>
              {user?.role === 'superadmin' && (
                <button onClick={() => setDeleteModal({ open: true, employee: row })} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400" title="Terminate">
                  <Trash2 size={15} />
                </button>
              )}
            </>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">{pagination.total} total employees</p>
        </div>
        {['superadmin', 'hr'].includes(user?.role) && (
          <Link to="/employees/new" id="add-employee-btn" className="btn-primary">
            <Plus size={16} /> Add Employee
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ID..."
            className="input pl-9 py-2.5 text-sm" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="select py-2.5 text-sm w-full sm:w-44">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select py-2.5 text-sm w-full sm:w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={employees} loading={loading} searchable={false} pagination={false} />

      {/* Server-side pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchEmployees(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === pagination.page ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-white/5 card'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, employee: null })} title="Terminate Employee" size="sm">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Are you sure you want to terminate <strong className="text-white">{deleteModal.employee?.firstName} {deleteModal.employee?.lastName}</strong>?
            This will deactivate their account.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteModal({ open: false, employee: null })} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
              {deleting ? 'Terminating...' : 'Terminate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Employees
