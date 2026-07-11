import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, DollarSign, UserCircle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-primary-400" />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-white font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
)

const EmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/employees/${id}`)
      .then(r => setEmployee(r.data.data))
      .catch(() => { toast.error('Employee not found'); navigate('/employees') })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>
  if (!employee) return null

  const statusColor = { active: 'badge-success', inactive: 'badge-warning', terminated: 'badge-danger' }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 rounded-xl"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="page-title">Employee Profile</h1>
          <p className="text-slate-500 text-sm">{employee.employeeId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          {employee.profilePhoto ? (
            <img src={employee.profilePhoto} alt={employee.firstName} className="w-24 h-24 rounded-2xl object-cover mb-4 border-2 border-primary-500/30" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-glow">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">{employee.firstName} {employee.lastName}</h2>
          <p className="text-primary-400 text-sm mt-1">{employee.designation?.title}</p>
          <p className="text-slate-500 text-xs mt-0.5">{employee.department?.name}</p>
          <span className={`badge mt-3 ${statusColor[employee.status] || 'badge-gray'}`}>{employee.status}</span>

          {['superadmin', 'hr'].includes(user?.role) && (
            <Link to={`/employees/${id}/edit`} className="btn-primary mt-5 w-full text-sm">
              <Pencil size={14} /> Edit Profile
            </Link>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={employee.email} />
              <InfoRow icon={Phone} label="Phone" value={employee.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={employee.dob ? format(new Date(employee.dob), 'dd MMM yyyy') : null} />
              <InfoRow icon={UserCircle} label="Gender" value={employee.gender} />
              <InfoRow icon={Calendar} label="Joining Date" value={employee.joiningDate ? format(new Date(employee.joiningDate), 'dd MMM yyyy') : null} />
              <InfoRow icon={DollarSign} label="Salary" value={employee.salary ? `₹${Number(employee.salary).toLocaleString()}/month` : null} />
            </div>
          </div>

          {/* Address */}
          {employee.address && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Address</h3>
              <InfoRow icon={MapPin} label="Location"
                value={[employee.address.street, employee.address.city, employee.address.state, employee.address.country].filter(Boolean).join(', ')} />
            </div>
          )}

          {/* Emergency Contact */}
          {employee.emergencyContact?.name && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={UserCircle} label="Name" value={employee.emergencyContact.name} />
                <InfoRow icon={Phone} label="Phone" value={employee.emergencyContact.phone} />
                <InfoRow icon={UserCircle} label="Relation" value={employee.emergencyContact.relation} />
              </div>
            </div>
          )}

          {/* Leave Balance */}
          {employee.leaveBalance && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Leave Balance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(employee.leaveBalance).map(([type, days]) => (
                  <div key={type} className="text-center p-3 rounded-xl bg-dark-700/50 border border-white/5">
                    <p className="text-2xl font-bold text-white">{days}</p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">{type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetail
