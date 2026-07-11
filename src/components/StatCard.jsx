import { TrendingUp } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color = 'primary', change, subtitle }) => {
  const colorMap = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:     'bg-red-500/10 text-red-400 border-red-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  const iconClass = colorMap[color] || colorMap.primary

  return (
    <div className="stat-card group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconClass} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {(change !== undefined || subtitle) && (
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            {change !== undefined && (
              <span className={`flex items-center gap-0.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendingUp size={11} className={change < 0 ? 'rotate-180' : ''} />
                {Math.abs(change)}%
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatCard
