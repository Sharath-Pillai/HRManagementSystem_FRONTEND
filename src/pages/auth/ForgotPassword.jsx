import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle size={48} className="text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
      <p className="text-slate-400 text-sm mb-6">We sent a password reset link to <strong className="text-white">{email}</strong></p>
      <Link to="/login" className="btn-secondary w-full block text-center">Back to Login</Link>
    </div>
  )

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Forgot Password</h2>
      <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" className="input pl-10" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
        </button>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mt-2">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </form>
    </div>
  )
}

export default ForgotPassword
