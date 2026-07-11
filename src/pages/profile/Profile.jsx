import { useState, useEffect } from 'react'
import { User, Mail, Phone, Camera, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    // Try to find employee record linked to user
    api.get('/employees?limit=100').then(r => {
      const emp = r.data.data.employees.find(e => e.user === user?._id || e.email === user?.email)
      setEmployee(emp || null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match')
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setChangingPass(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally { setChangingPass(false) }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="page-title">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl border border-white/5 w-fit">
        {['profile','security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'profile' ? '👤 Profile' : '🔒 Security'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-glow">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-800 border-2 border-dark-800 flex items-center justify-center">
                <Camera size={13} className="text-primary-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-primary-400 text-sm capitalize">{user?.role}</p>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <span className={`badge mt-2 ${user?.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{user?.status}</span>
            </div>
          </div>

          {/* User Info */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50">
                <User size={16} className="text-primary-400" />
                <div><p className="text-xs text-slate-500">Full Name</p><p className="text-sm text-white">{user?.name}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50">
                <Mail size={16} className="text-primary-400" />
                <div><p className="text-xs text-slate-500">Email</p><p className="text-sm text-white">{user?.email}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50">
                <User size={16} className="text-primary-400" />
                <div><p className="text-xs text-slate-500">Role</p><p className="text-sm text-white capitalize">{user?.role}</p></div>
              </div>
              {user?.employeeId && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50">
                  <User size={16} className="text-primary-400" />
                  <div><p className="text-xs text-slate-500">Employee ID</p><p className="text-sm text-white">{user?.employeeId}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Details */}
          {employee && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Employment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['Phone', employee.phone],
                  ['Department', employee.department?.name],
                  ['Designation', employee.designation?.title],
                  ['Joining Date', employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : null],
                ].map(([label, val]) => val ? (
                  <div key={label} className="p-3 rounded-xl bg-dark-700/50">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm text-white mt-0.5">{val}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Security Tab */
        <div className="card p-6">
          <h3 className="section-title mb-6">Change Password</h3>
          <form onSubmit={handlePassChange} className="space-y-4 max-w-sm">
            {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
              <div key={field}>
                <label className="input-label">
                  {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} value={passForm[field]}
                    onChange={e => setPassForm(f => ({...f, [field]: e.target.value}))}
                    className="input pl-10 pr-10" required minLength={field !== 'currentPassword' ? 6 : 1} />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={changingPass} className="btn-primary w-full">
              {changingPass ? <><Loader2 size={15} className="animate-spin" /> Changing...</> : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Profile
