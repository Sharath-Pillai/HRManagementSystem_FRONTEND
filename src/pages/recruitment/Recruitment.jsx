import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, Calendar, Briefcase, Loader2, ChevronRight } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import { format } from 'date-fns'

const STATUS_COLORS = {
  applied: 'badge-info', shortlisted: 'badge-purple',
  interview: 'badge-warning', selected: 'badge-success', rejected: 'badge-danger',
}
const PIPELINE = ['applied','shortlisted','interview','selected','rejected']

const Recruitment = () => {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, type: null, data: null })
  const [saving, setSaving] = useState(false)
  const [jobForm, setJobForm] = useState({ title:'', department:'', description:'', openings:1, type:'full-time', status:'open' })
  const [activeTab, setActiveTab] = useState('jobs')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [j, d] = await Promise.all([api.get('/recruitment/jobs'), api.get('/departments')])
      setJobs(j.data.data)
      setDepartments(d.data.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const fetchCandidates = async (jobId) => {
    try {
      const { data } = await api.get(`/recruitment/candidates?jobId=${jobId}`)
      setCandidates(data.data)
    } catch {}
  }

  const selectJob = (job) => {
    setSelectedJob(job)
    setActiveTab('pipeline')
    fetchCandidates(job._id)
  }

  const openJobModal = (data = null) => {
    setModal({ open: true, type: 'job', data })
    if (data) setJobForm({ title: data.title, department: data.department?._id || '', description: data.description, openings: data.openings, type: data.type, status: data.status })
    else setJobForm({ title:'', department:'', description:'', openings:1, type:'full-time', status:'open' })
  }

  const saveJob = async () => {
    setSaving(true)
    try {
      modal.data ? await api.put(`/recruitment/jobs/${modal.data._id}`, jobForm) : await api.post('/recruitment/jobs', jobForm)
      toast.success(modal.data ? 'Job updated!' : 'Job posted!')
      setModal({ open:false, type:null, data:null })
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const updateCandidateStatus = async (candidateId, status) => {
    try {
      await api.put(`/recruitment/candidates/${candidateId}/status`, { status })
      fetchCandidates(selectedJob._id)
      toast.success('Status updated')
    } catch { toast.error('Update failed') }
  }

  const deleteJob = async (id) => {
    if (!confirm('Delete this job posting?')) return
    try {
      await api.delete(`/recruitment/jobs/${id}`)
      toast.success('Deleted')
      fetchAll()
      if (selectedJob?._id === id) { setSelectedJob(null); setActiveTab('jobs') }
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Recruitment</h1>
        <button onClick={() => openJobModal()} className="btn-primary"><Plus size={16} /> Post Job</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl border border-white/5 w-fit">
        {['jobs', 'pipeline'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'pipeline' ? `Pipeline${selectedJob ? ` – ${selectedJob.title}` : ''}` : 'Job Openings'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div> :
        activeTab === 'jobs' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.length === 0 ? <p className="text-slate-500 text-sm col-span-3 text-center py-12">No job openings yet</p> :
              jobs.map(job => (
                <div key={job._id} className="card-hover p-5 cursor-pointer group" onClick={() => selectJob(job)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                      <Briefcase size={18} className="text-primary-400" />
                    </div>
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-gray'}`}>{job.status}</span>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.department?.name}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users size={11} />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                    <span className="capitalize">{job.type}</span>
                  </div>
                  <div className="flex gap-1 mt-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openJobModal(job)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-amber-400 text-xs"><Pencil size={13} /></button>
                    <button onClick={() => deleteJob(job._id)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400 text-xs"><Trash2 size={13} /></button>
                    <button onClick={() => selectJob(job)} className="btn-ghost p-1.5 rounded-lg text-slate-400 hover:text-primary-400 text-xs ml-auto flex items-center gap-1">
                      View Pipeline <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Kanban Pipeline */
          <div>
            {!selectedJob ? (
              <div className="text-center py-12"><p className="text-slate-500">Select a job from Job Openings to view the pipeline</p></div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {PIPELINE.map(stage => {
                  const stageCandidates = candidates.filter(c => c.status === stage)
                  return (
                    <div key={stage} className="card p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`badge capitalize ${STATUS_COLORS[stage]}`}>{stage}</span>
                        <span className="text-xs font-bold text-white">{stageCandidates.length}</span>
                      </div>
                      <div className="space-y-2">
                        {stageCandidates.map(c => (
                          <div key={c._id} className="p-3 rounded-xl bg-dark-700 border border-white/5 text-xs">
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-slate-500 mt-0.5">{c.email}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {PIPELINE.filter(s => s !== stage && s !== 'rejected').map(s => (
                                <button key={s} onClick={() => updateCandidateStatus(c._id, s)}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-dark-600 text-slate-400 hover:bg-primary-500/20 hover:text-primary-300 transition-colors capitalize">
                                  → {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        {stageCandidates.length === 0 && <p className="text-slate-600 text-xs text-center py-3">Empty</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      {/* Job Modal */}
      <Modal isOpen={modal.open && modal.type === 'job'} onClose={() => setModal({ open:false, type:null, data:null })}
        title={modal.data ? 'Edit Job' : 'Post New Job'} size="md">
        <div className="space-y-4">
          <div><label className="input-label">Job Title *</label><input value={jobForm.title} onChange={e => setJobForm(f=>({...f,title:e.target.value}))} className="input" required /></div>
          <div>
            <label className="input-label">Department *</label>
            <select value={jobForm.department} onChange={e => setJobForm(f=>({...f,department:e.target.value}))} className="select">
              <option value="">Select</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="input-label">Openings</label><input type="number" value={jobForm.openings} onChange={e => setJobForm(f=>({...f,openings:+e.target.value}))} className="input" min="1" /></div>
            <div>
              <label className="input-label">Type</label>
              <select value={jobForm.type} onChange={e => setJobForm(f=>({...f,type:e.target.value}))} className="select">
                {['full-time','part-time','contract','internship'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select value={jobForm.status} onChange={e => setJobForm(f=>({...f,status:e.target.value}))} className="select">
                <option value="open">Open</option><option value="on-hold">On Hold</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div><label className="input-label">Description</label><textarea value={jobForm.description} onChange={e => setJobForm(f=>({...f,description:e.target.value}))} className="input resize-none h-24" /></div>
          <div className="flex gap-3">
            <button onClick={() => setModal({ open:false, type:null, data:null })} className="btn-secondary flex-1">Cancel</button>
            <button onClick={saveJob} disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Job'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Recruitment
