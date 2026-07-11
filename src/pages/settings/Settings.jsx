import { useState } from 'react'
import { Settings as SettingsIcon, Bell, Shield, Database, Globe } from 'lucide-react'

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <div className="card p-6">
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
        <Icon size={16} className="text-primary-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
)

const Toggle = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm text-slate-300">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-primary-500' : 'bg-dark-500 border border-white/20'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
)

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    leaveNotifications: true,
    payrollNotifications: true,
    twoFactor: false,
    darkMode: true,
    compactView: false,
    language: 'en',
    timezone: 'Asia/Kolkata',
  })
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your application preferences</p>
      </div>

      <SettingSection icon={Bell} title="Notifications" description="Control which notifications you receive">
        <div className="divide-y divide-white/5">
          <Toggle label="Email Notifications" description="Receive notifications via email" value={settings.emailNotifications} onChange={v => set('emailNotifications', v)} />
          <Toggle label="Leave Approvals" description="Get notified when leaves are approved/rejected" value={settings.leaveNotifications} onChange={v => set('leaveNotifications', v)} />
          <Toggle label="Payroll Alerts" description="Get notified when salary is processed" value={settings.payrollNotifications} onChange={v => set('payrollNotifications', v)} />
        </div>
      </SettingSection>

      <SettingSection icon={Shield} title="Security" description="Manage your account security settings">
        <div className="divide-y divide-white/5">
          <Toggle label="Two-Factor Authentication" description="Add extra layer of security" value={settings.twoFactor} onChange={v => set('twoFactor', v)} />
        </div>
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
          ⚠️ 2FA implementation requires TOTP setup. Contact your system administrator.
        </div>
      </SettingSection>

      <SettingSection icon={Globe} title="Preferences" description="Localization and display settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Language</label>
            <select value={settings.language} onChange={e => set('language', e.target.value)} className="select">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div>
            <label className="input-label">Timezone</label>
            <select value={settings.timezone} onChange={e => set('timezone', e.target.value)} className="select">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New York (EST)</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-white/5 mt-4">
          <Toggle label="Compact View" description="Show more data with less spacing" value={settings.compactView} onChange={v => set('compactView', v)} />
        </div>
      </SettingSection>

      <SettingSection icon={Database} title="Data & Privacy" description="Manage your data and account">
        <div className="space-y-3">
          <button className="btn-secondary w-full text-sm">Export My Data</button>
          <button className="btn-danger w-full text-sm opacity-60 cursor-not-allowed" disabled>Delete Account (Contact Admin)</button>
        </div>
      </SettingSection>
    </div>
  )
}

export default Settings
