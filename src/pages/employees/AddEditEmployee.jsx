import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const FormGroup = ({ label, children, required }) => (
  <div>
    <label className="input-label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    {children}
  </div>
)

const AddEditEmployee = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [filteredDesig, setFilteredDesig] = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: '',
    dob: '', joiningDate: '', department: '', designation: '', manager: '',
    salary: '', role: 'employee',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    emergencyContact: { name: '', relation: '', phone: '' },
    photo: null,
  })

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data)).catch(() => {})
    api.get('/designations').then(r => setDesignations(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.department) {
      setFilteredDesig(designations.filter(d => d.department?._id === form.department || d.department === form.department))
    } else setFilteredDesig(designations)
  }, [form.department, designations])

  useEffect(() => {
    if (isEdit) {
      api.get(`/employees/${id}`).then(r => {
        const e = r.data.data
        setForm({
          firstName: e.firstName || '', lastName: e.lastName || '',
          email: e.email || '', phone: e.phone || '', gender: e.gender || '',
          dob: e.dob ? e.dob.split('T')[0] : '',
          joiningDate: e.joiningDate ? e.joiningDate.split('T')[0] : '',
          department: e.department?._id || '', designation: e.designation?._id || '',
          manager: e.manager?._id || '', salary: e.salary || '', role: 'employee',
          address: e.address || { street: '', city: '', state: '', country: '', zipCode: '' },
          emergencyContact: e.emergencyContact || { name: '', relation: '', phone: '' },
          photo: null,
        })
        if (e.profilePhoto) setPhotoPreview(e.profilePhoto)
      }).catch(() => toast.error('Failed to load employee')).finally(() => setFetchLoading(false))
    }
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setNested = (group, key, val) => setForm(f => ({ ...f, [group]: { ...f[group], [key]: val } }))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    set('photo', file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'photo' && v) fd.append('profilePhoto', v)
        else if (k === 'address' || k === 'emergencyContact') fd.append(k, JSON.stringify(v))
        else if (v !== '') fd.append(k, v)
      })
      if (isEdit) await api.put(`/employees/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await api.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(isEdit ? 'Employee updated!' : 'Employee created! Temp password shown in response.')
      navigate('/employees')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl"><ArrowLeft size={18} /></button>
        <h1 className="page-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="card p-6 flex items-center gap-5">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-500/30" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-dark-700 border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500">
                <Upload size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white mb-1">Profile Photo</p>
            <label className="btn-secondary text-xs cursor-pointer">
              <Upload size={13} /> Choose File
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="First Name" required><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input" required /></FormGroup>
            <FormGroup label="Last Name" required><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input" required /></FormGroup>
            <FormGroup label="Email" required><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" required /></FormGroup>
            <FormGroup label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" /></FormGroup>
            <FormGroup label="Gender">
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="select">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>
            <FormGroup label="Date of Birth"><input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="input" /></FormGroup>
          </div>
        </div>

        {/* Employment Info */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Employment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Joining Date" required>
              <input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} className="input" required />
            </FormGroup>
            <FormGroup label="Salary (₹/month)" required>
              <input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} className="input" required min="0" />
            </FormGroup>
            <FormGroup label="Department" required>
              <select value={form.department} onChange={e => set('department', e.target.value)} className="select" required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Designation" required>
              <select value={form.designation} onChange={e => set('designation', e.target.value)} className="select" required>
                <option value="">Select Designation</option>
                {filteredDesig.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Role">
              <select value={form.role} onChange={e => set('role', e.target.value)} className="select">
                <option value="employee">Employee</option>
                <option value="manager">Team Manager</option>
                <option value="hr">HR Manager</option>
              </select>
            </FormGroup>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Street"><input value={form.address.street} onChange={e => setNested('address','street',e.target.value)} className="input" /></FormGroup>
            <FormGroup label="City"><input value={form.address.city} onChange={e => setNested('address','city',e.target.value)} className="input" /></FormGroup>
            <FormGroup label="State"><input value={form.address.state} onChange={e => setNested('address','state',e.target.value)} className="input" /></FormGroup>
            <FormGroup label="Country"><input value={form.address.country} onChange={e => setNested('address','country',e.target.value)} className="input" /></FormGroup>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormGroup label="Name"><input value={form.emergencyContact.name} onChange={e => setNested('emergencyContact','name',e.target.value)} className="input" /></FormGroup>
            <FormGroup label="Relation"><input value={form.emergencyContact.relation} onChange={e => setNested('emergencyContact','relation',e.target.value)} className="input" /></FormGroup>
            <FormGroup label="Phone"><input value={form.emergencyContact.phone} onChange={e => setNested('emergencyContact','phone',e.target.value)} className="input" /></FormGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> {isEdit ? 'Saving...' : 'Creating...'}</> : (isEdit ? 'Save Changes' : 'Create Employee')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEditEmployee
