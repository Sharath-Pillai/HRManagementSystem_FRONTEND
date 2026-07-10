import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'

const DataTable = ({ columns, data, loading, searchable = true, pagination = true, pageSize = 10 }) => {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return data
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : ''
        return String(val ?? '').toLowerCase().includes(search.toLowerCase())
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  const handleSort = (key) => {
    if (!key) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sortKey !== col.accessor) return <ChevronsUpDown size={14} className="text-slate-600" />
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-primary-400" /> : <ChevronDown size={14} className="text-primary-400" />
  }

  return (
    <div className="table-container">
      {searchable && (
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search table..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                  className={col.sortable ? 'cursor-pointer select-none hover:text-white' : ''}
                >
                  <span className="flex items-center gap-1">
                    {col.header} <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center py-12">
                <div className="flex justify-center"><div className="spinner" /></div>
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-slate-500">No records found</td></tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={i} className="animate-fade-in">
                  {columns.map((col, j) => (
                    <td key={j}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 rounded-lg disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 rounded-lg disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
