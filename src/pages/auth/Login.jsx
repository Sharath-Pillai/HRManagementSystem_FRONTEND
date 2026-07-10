import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

//   const fillDemo = (role) => {
//     const creds = {
//       admin:   { email: 'admin@hrms.com',   password: 'Admin@1234' },
//       hr:      { email: 'hr@hrms.com',      password: 'Hr@12345' },
//       manager: { email: 'manager@hrms.com', password: 'Manager@1234' },
//       emp:     { email: 'amit@hrms.com',    password: 'Emp@12345' },
//     }
//     setForm(creds[role])
//   }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
      <p className="text-slate-500 text-sm mb-6">Enter your credentials to access your account</p>

      {/* Demo credentials */}
      {/* <div className="mb-6 p-3 rounded-xl bg-dark-700/50 border border-white/5">
        <p className="text-xs text-slate-500 mb-2 font-medium">Quick Demo Login:</p>
        <div className="flex flex-wrap gap-1.5">
          {['admin', 'hr', 'manager', 'emp'].map((r) => (
            <button key={r} onClick={() => fillDemo(r)}
              className="text-xs px-3 py-1 rounded-lg bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 border border-primary-500/20 transition-colors capitalize">
              {r === 'emp' ? 'Employee' : r === 'admin' ? 'Super Admin' : r === 'hr' ? 'HR Manager' : 'Team Manager'}
            </button>
          ))}
        </div>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input id="login-email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              placeholder="you@company.com" className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input id="login-password" type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))}
              placeholder="••••••••" className="input pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            Forgot password?
          </Link>
        </div>
        <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default Login
