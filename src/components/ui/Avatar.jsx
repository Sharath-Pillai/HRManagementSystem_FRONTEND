/**
 * Avatar component — shows photo, or initials fallback.
 * Props: name, src, size (sm|md|lg|xl), className
 */
const sizeMap = {
  sm:  'w-7 h-7 text-xs',
  md:  'w-9 h-9 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
}

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClass = sizeMap[size] || sizeMap.md

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow ${sizeClass} ${className}`}
      title={name}
    >
      {initials || '?'}
    </div>
  )
}

export default Avatar
