import { useState, useEffect, useRef } from 'react'

/**
 * Hook that returns true after `delay` ms (for debouncing search inputs).
 */
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/**
 * Hook that detects clicks outside a ref element.
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null)
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [handler])
  return ref
}

/**
 * Hook to track window size.
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

/**
 * Returns true if the screen is mobile (<= 768px).
 */
export const useIsMobile = () => {
  const { width } = useWindowSize()
  return width <= 768
}
