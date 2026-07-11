import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Building2, Users, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, type: 'dept', data: null })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', title: '', department: '' })
  const [activeTab, setActiveTab] = useState('departments')

  const fetchAll = async () => {
    try {
      const [d, dsg] = await Promise.all([api.get('/departments'), api.get('/designations')])
      setDepartments(d.data.data)
      setDesignations(dsg.data.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openModal = (type, data = null) => {
    setModal({ open: true, type, data })
    if (data) {
      if (type === 'dept') setForm({ name: data.name, description: data.description || '', title: '', department: '' })
      else setForm({ name: '', description: '', title: data.title, department: data.department?._id || '' })
    } else setForm({ name: '', description: '', title: '', department: '' })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { type, data } = modal
      if (type === 'dept') {
        const payload = { name: form.name, description: form.description }
        data ? await api.put(`/departments/${data._id}`, payload) : await api.post('/departments', payload)
      } else {
        const payload = { title: form.title, department: form.department }
        data ? await api.put(`/designations/${data._id}`, payload) : await api.post('/designations', payload)
      }
      toast.success(`${type === 'dept' ? 'Department' : 'Designation'} ${data ? 'updated' : 'created'}!`)
      setModal({ open: false, type: 'dept', data: null })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return
    try {
      type === 'dept' ? await api.delete(`/departments/${id}`) : await api.delete(`/designations/${id}`)
      toast.success('Deleted successfully')
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Departments & Designations</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl border border-white/5 w-fit">
        {['departments','designations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>
      ) : activeTab === 'departments' ? (
        <div className="space-y-4">
          <button onClick={() => openModal('dept')} className="btn-primary ml-auto flex">
            <Plus size={16} /> Add Department
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept._id} className="card-hover p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <Building2 size={18} className="text-primary-400" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal('dept', dept)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-amber-400"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete('dept', dept._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-white font-semibold mt-3">{dept.name}</h3>
                {dept.description && <p className="text-slate-400 text-xs mt-1">{dept.description}</p>}
                {dept.head && <p className="text-xs text-primary-400 mt-2 flex items-center gap-1"><Users size={11} /> {dept.head.name}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => openModal('desig')} className="btn-primary ml-auto flex">
            <Plus size={16} /> Add Designation
          </button>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Department</th><th>Actions</th></tr></thead>
              <tbody>
                {designations.map(d => (
                  <tr key={d._id}>
                    <td className="font-medium text-white">{d.title}</td>
                    <td><span className="badge badge-info">{d.department?.name || '—'}</span></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openModal('desig', d)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-amber-400"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete('desig', d._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, type: 'dept', data: null })}
        title={`${modal.data ? 'Edit' : 'Add'} ${modal.type === 'dept' ? 'Department' : 'Designation'}`} size="sm">
        <div className="space-y-4">
          {modal.type === 'dept' ? (
            <>
              <div><label className="input-label">Name *</label><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input" required /></div>
              <div><label className="input-label">Description</label><textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className="input resize-none h-20" /></div>
            </>
          ) : (
            <>
              <div><label className="input-label">Title *</label><input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} className="input" required /></div>
              <div>
                <label className="input-label">Department *</label>
                <select value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))} className="select">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal({ open: false, type: 'dept', data: null })} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Departments
