import { useState, useEffect } from 'react'
import { Upload, Trash2, FileText, Download, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['offer-letter','joining-letter','id-proof','certificate','salary-slip','other']

const categoryBadge = (cat) => {
  const colors = { 'offer-letter':'badge-success','joining-letter':'badge-info','id-proof':'badge-warning','certificate':'badge-purple','salary-slip':'badge-blue','other':'badge-gray' }
  return <span className={`badge ${colors[cat] || 'badge-gray'} capitalize`}>{cat.replace('-',' ')}</span>
}

const Documents = () => {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [empFilter, setEmpFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [uploadForm, setUploadForm] = useState({ employeeId: '', category: '', file: null })

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (empFilter) params.set('employeeId', empFilter)
      if (catFilter) params.set('category', catFilter)
      const { data } = await api.get(`/documents?${params}`)
      setDocs(data.data)
    } catch { toast.error('Failed to load documents') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [empFilter, catFilter])
  useEffect(() => {
    api.get('/employees?limit=100').then(r => setEmployees(r.data.data.employees)).catch(() => {})
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.employeeId || !uploadForm.category) return toast.error('Fill all fields')
    setUploading(true)
    const fd = new FormData()
    fd.append('file', uploadForm.file)
    fd.append('employeeId', uploadForm.employeeId)
    fd.append('category', uploadForm.category)
    try {
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded!')
      setUploadForm({ employeeId: '', category: '', file: null })
      fetchDocs()
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Deleted')
      fetchDocs()
    } catch { toast.error('Delete failed') }
  }

  const formatBytes = (b) => b > 1024*1024 ? `${(b/1024/1024).toFixed(1)}MB` : `${(b/1024).toFixed(0)}KB`

  return (
    <div className="space-y-6">
      <h1 className="page-title">Document Management</h1>

      {/* Upload Panel */}
      <div className="card p-6">
        <h3 className="section-title mb-4">Upload Document</h3>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="input-label">Employee</label>
            <select value={uploadForm.employeeId} onChange={e => setUploadForm(f=>({...f,employeeId:e.target.value}))} className="select" required>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="input-label">Category</label>
            <select value={uploadForm.category} onChange={e => setUploadForm(f=>({...f,category:e.target.value}))} className="select" required>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('-',' ')}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="input-label">File</label>
            <label className="btn-secondary w-full cursor-pointer justify-start">
              <Upload size={14} />
              {uploadForm.file ? uploadForm.file.name : 'Choose File'}
              <input type="file" className="hidden" onChange={e => setUploadForm(f=>({...f,file:e.target.files[0]}))} />
            </label>
          </div>
          <button type="submit" disabled={uploading} className="btn-primary px-6 py-3 flex-shrink-0">
            {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : 'Upload'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={empFilter} onChange={e => setEmpFilter(e.target.value)} className="select py-2 text-sm">
          <option value="">All Employees</option>
          {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="select py-2 text-sm w-44">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('-',' ')}</option>)}
        </select>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
      ) : docs.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">No documents found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc._id} className="card-hover p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                  <FileText size={18} className="text-primary-400" />
                </div>
                <div className="flex gap-1">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-primary-400" title="View/Download">
                    <Download size={14} />
                  </a>
                  {['superadmin','hr'].includes(user?.role) && (
                    <button onClick={() => handleDelete(doc._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              <p className="font-medium text-white text-sm truncate" title={doc.fileName}>{doc.fileName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{doc.employee?.firstName} {doc.employee?.lastName}</p>
              <div className="flex items-center justify-between mt-3">
                {categoryBadge(doc.category)}
                <span className="text-xs text-slate-600">{doc.fileSize ? formatBytes(doc.fileSize) : ''}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{format(new Date(doc.createdAt), 'dd MMM yyyy')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Documents
