import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

/**
 * Generic data-fetching hook.
 * @param {string} url - API endpoint path (e.g. '/employees')
 * @param {object} params - Optional query params object
 */
const useApi = (url, params = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramString = JSON.stringify(params)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const queryString = new URLSearchParams(params).toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url
      const { data: res } = await api.get(fullUrl)
      setData(res.data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [url, paramString])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export default useApi
