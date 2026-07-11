/**
 * Spinner component.
 * Props: size (sm|md|lg), className
 */
const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }

export const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin ${sizeMap[size]} ${className}`} />
)

/**
 * Full-screen loading overlay.
 */
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto" />
      <p className="text-slate-500 text-sm mt-3">Loading...</p>
    </div>
  </div>
)

/**
 * Empty state placeholder.
 * Props: icon, title, description, action (optional JSX)
 */
export const EmptyState = ({ icon: Icon, title = 'No data', description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon size={48} className="text-slate-700 mb-4" />}
    <h3 className="text-slate-300 font-semibold">{title}</h3>
    {description && <p className="text-slate-500 text-sm mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

/**
 * Confirm dialog — simple, uses window.confirm under the hood.
 * For styled modals, use <Modal> instead.
 */
export const confirm = (message) => window.confirm(message)

export default Spinner
