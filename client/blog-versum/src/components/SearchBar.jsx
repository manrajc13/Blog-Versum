import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { hexToRgba } from '../store/themeConfig'
import SearchResultsDropdown from './SearchResultsDropdown'
import {axiosInstance} from '../lib/axios'

const TYPE_FILTERS   = ['All', 'Authors', 'Blogs']
const ORIGIN_FILTERS = ['All', 'Human', 'AI']

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar({ iconColor }) {
  const navigate     = useNavigate()
  const [query,        setQuery]        = useState('')
  const [typeFilter,   setTypeFilter]   = useState('All')
  const [originFilter, setOriginFilter] = useState('All')
  const [open,         setOpen]         = useState(false)
  const [results,      setResults]      = useState({ authors: [], posts: [] })
  const [fetching,     setFetching]     = useState(false)
  const containerRef = useRef(null)
  const inputRef     = useRef(null)

  const debouncedQuery = useDebounce(query, 300)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch from API on debounced query / filter change
  useEffect(() => {
    const q = debouncedQuery.trim()
    if (!q) {
      setResults({ authors: [], posts: [] })
      setOpen(false)
      return
    }

    const isBlog = typeFilter === 'Authors' ? 'false'
             : typeFilter === 'Blogs'   ? 'true'
             : 'all'

    const userType = originFilter === 'All' ? 'undefined' : originFilter

    setFetching(true)
    setOpen(true)
    axiosInstance.get(`/search/${encodeURIComponent(q)}/${isBlog}/${userType}`)
      .then((res) => {
        setResults({
          authors: (res.data.users || []).map(u => ({
            ...u,
            isAI: u.authorType === 'AI',
          })),
          posts: (res.data.posts || []).map(p => ({
            ...p,
            isAI: p.authorType === 'AI',
            author: { username: p.username },
          })),
        })
      })
      .catch(() => setResults({ authors: [], posts: [] }))
      .finally(() => setFetching(false))

  }, [debouncedQuery, typeFilter, originFilter])

  const filteredAuthors = results.authors
  const filteredPosts   = results.posts
  const hasResults      = filteredAuthors.length > 0 || filteredPosts.length > 0

  // Navigate to full results page on Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false)
      const params = new URLSearchParams({ q: query.trim() })
      if (typeFilter   !== 'All') params.set('type',   typeFilter.toLowerCase())
      if (originFilter !== 'All') params.set('origin', originFilter.toLowerCase())
      navigate(`/search?${params.toString()}`)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const goToSearchPage = () => {
    if (!query.trim()) return
    setOpen(false)
    const params = new URLSearchParams({ q: query.trim() })
    if (typeFilter   !== 'All') params.set('type',   typeFilter.toLowerCase())
    if (originFilter !== 'All') params.set('origin', originFilter.toLowerCase())
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">

      <div className="flex flex-col gap-1.5">
        <div
          className="flex w-full items-center rounded-full border-2 overflow-hidden h-10 min-w-64"
          style={{
            backgroundColor: hexToRgba(iconColor, 0.08),
            borderColor: open ? iconColor : hexToRgba(iconColor, 0.3),
            transition: 'border-color 0.2s',
          }}
        >
          <div className="flex items-center justify-center pl-4" style={{ color: iconColor }}>
            {fetching
              ? <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              : <span className="material-symbols-outlined text-[20px]">search</span>
            }
          </div>
          <input
            ref={inputRef}
            className="flex-1 border-none bg-transparent focus:ring-0 px-3 text-sm font-medium outline-none placeholder:text-slate-400"
            placeholder="Find magic stories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (debouncedQuery.trim()) setOpen(true) }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="pr-3"
              style={{ color: hexToRgba(iconColor, 0.5) }}
              onClick={() => { setQuery(''); setOpen(false) }}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter chips */}
        {open && (
          <div className="flex items-center gap-1.5 px-1 flex-wrap">
            <div className="flex items-center gap-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className="text-[11px] font-black px-2.5 py-0.5 rounded-full border transition-all"
                  style={
                    typeFilter === f
                      ? { backgroundColor: iconColor, color: '#fff', borderColor: iconColor }
                      : { backgroundColor: 'transparent', color: hexToRgba(iconColor, 0.65), borderColor: hexToRgba(iconColor, 0.25) }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-slate-300 text-xs">·</span>
            <div className="flex items-center gap-1">
              {ORIGIN_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setOriginFilter(f)}
                  className="text-[11px] font-black px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1"
                  style={
                    originFilter === f
                      ? { backgroundColor: iconColor, color: '#fff', borderColor: iconColor }
                      : { backgroundColor: 'transparent', color: hexToRgba(iconColor, 0.65), borderColor: hexToRgba(iconColor, 0.25) }
                  }
                >
                  {f === 'AI'    && <span className="material-symbols-outlined text-[11px]">smart_toy</span>}
                  {f === 'Human' && <span className="material-symbols-outlined text-[11px]">person</span>}
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {open && (
        <SearchResultsDropdown
          authors={filteredAuthors}
          posts={filteredPosts}
          hasResults={hasResults}
          fetching={fetching}
          query={debouncedQuery}
          iconColor={iconColor}
          typeFilter={typeFilter}
          onClose={() => setOpen(false)}
          onSeeAll={goToSearchPage}
        />
      )}
    </div>
  )
}