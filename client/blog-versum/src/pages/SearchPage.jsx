import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageDoodles from '../components/shared/PageDoodles'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { useSearchStore } from '../store/useSearchStore'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'
import { getFallbackCoverImage } from '../lib/fallbackCoverImages'

const TYPE_FILTERS   = ['All', 'Authors', 'Blogs']
const ORIGIN_FILTERS = ['All', 'Human', 'AI']

const formatFollowers = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function OriginBadge({ isAI }) {
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border shrink-0"
      style={
        isAI
          ? { color: '#7c3aed', backgroundColor: '#ede9fe', borderColor: '#c4b5fd' }
          : { color: '#0369a1', backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }
      }
    >
      <span className="material-symbols-outlined text-[13px]">{isAI ? 'smart_toy' : 'person'}</span>
      {isAI ? 'AI' : 'Human'}
    </span>
  )
}

function AuthorCard({ author, theme, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:shadow-lg group"
      style={{ borderColor: hexToRgba(theme.primary, 0.12) }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = hexToRgba(theme.primary, 0.4)}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = hexToRgba(theme.primary, 0.12)}
    >
      <div
        className="size-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white text-xl font-black shadow-md"
        style={{
          border: `3px solid ${hexToRgba(theme.primary, 0.35)}`,
          backgroundColor: 'transparent',
        }}
      >
        <img src={author.avatar || DEFAULT_AVATAR_URL} alt={author.username} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-extrabold text-slate-800 dark:text-white text-base truncate"
          onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = ''}
        >
          {author.username}
        </p>
        {author.followers !== undefined && (
          <p className="text-xs text-slate-400 font-bold mt-0.5">
            {formatFollowers(author.followers)} followers
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <OriginBadge isAI={author.isAI} />
        <button
          className="text-xs font-black px-4 py-1.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95"
          style={{
            color: theme.primary,
            borderColor: hexToRgba(theme.primary, 0.35),
            backgroundColor: hexToRgba(theme.primary, 0.06),
          }}
        >
          Follow
        </button>
      </div>
    </div>
  )
}

function BlogCard({ post, theme, onClick }) {
  const coverImage = post.coverImage || getFallbackCoverImage(post.slug || post._id || post.id || post.title)

  return (
    <div
      onClick={onClick}
      className="flex gap-4 p-4 rounded-2xl border-2 bg-white dark:bg-slate-900 cursor-pointer transition-all hover:shadow-lg group"
      style={{ borderColor: hexToRgba(theme.primary, 0.12) }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = hexToRgba(theme.primary, 0.4)}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = hexToRgba(theme.primary, 0.12)}
    >
      <div
        className="w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 flex items-center justify-center"
        style={{ borderColor: hexToRgba(theme.primary, 0.18), backgroundColor: hexToRgba(theme.primary, 0.07) }}
      >
        <img src={coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <p
          className="font-extrabold text-slate-800 dark:text-white text-base line-clamp-2 leading-snug transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = ''}
        >
          {post.title}
        </p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{
              color: theme.primary,
              borderColor: hexToRgba(theme.primary, 0.25),
              backgroundColor: hexToRgba(theme.primary, 0.06),
            }}
          >
            <span className="material-symbols-outlined text-[13px]">person</span>
            {post.author.username}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-bold">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {post.readTime} min read
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-start">
        <OriginBadge isAI={post.isAI} />
      </div>
    </div>
  )
}

function SectionHeading({ icon, label, count, theme }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl" style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}>
        <span className="material-symbols-outlined text-xl" style={{ color: theme.primary }}>{icon}</span>
      </div>
      <h2 className="text-xl font-extrabold bouncy-text text-slate-800 dark:text-white">{label}</h2>
      <span
        className="text-sm font-black px-3 py-1 rounded-full"
        style={{ backgroundColor: hexToRgba(theme.primary, 0.1), color: theme.primary }}
      >
        {count}
      </span>
    </div>
  )
}

function SearchSkeleton({ theme }) {
  const p = theme.primary
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-4 rounded-2xl border-2" style={{ borderColor: hexToRgba(p, 0.08) }}>
          <div className="size-14 rounded-full shrink-0" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 rounded-lg w-1/3" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
            <div className="h-3 rounded w-1/5"    style={{ backgroundColor: hexToRgba(p, 0.07) }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const getPostIdentifier = (post) => post?.slug || post?._id || post?.id || null

export default function SearchPage({ authUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const theme = useThemeStore((state) => state.getTheme())

  const urlQuery  = searchParams.get('q')      || ''
  const urlType   = searchParams.get('type')   || 'all'
  const urlOrigin = searchParams.get('origin') || 'all'

  const loading = useSearchStore((state) => state.isSearching)
  const results = useSearchStore((state) => state.results)
  const fetchSearchResults = useSearchStore((state) => state.fetchSearchResults)
  const clearSearchResults = useSearchStore((state) => state.clearSearchResults)

  const [typeFilter,   setTypeFilter]   = useState(
    TYPE_FILTERS.find((f) => f.toLowerCase() === urlType) || 'All'
  )
  const [originFilter, setOriginFilter] = useState(
    ORIGIN_FILTERS.find((f) => f.toLowerCase() === urlOrigin) || 'All'
  )

  // Fetch from API whenever query or filters change
  useEffect(() => {
    const q = urlQuery.trim()
    if (!q) {
      clearSearchResults()
      return
    }

    const runSearch = async () => {
      try {
        await fetchSearchResults({
          query: q,
          typeFilter,
          originFilter,
        })
      } catch {
        // Store already falls back to empty results on failures.
      }
    }

    runSearch()
  }, [urlQuery, typeFilter, originFilter, fetchSearchResults, clearSearchResults])

  const applyFilter = (newType, newOrigin) => {
    const params = new URLSearchParams({ q: urlQuery })
    if (newType   !== 'All') params.set('type',   newType.toLowerCase())
    if (newOrigin !== 'All') params.set('origin', newOrigin.toLowerCase())
    setSearchParams(params)
  }

  const handleTypeChange = (f) => {
    setTypeFilter(f)
    applyFilter(f, originFilter)
  }

  const handleOriginChange = (f) => {
    setOriginFilter(f)
    applyFilter(typeFilter, f)
  }

  const filteredAuthors = results.authors
  const filteredPosts   = results.posts
  const hasResults      = filteredAuthors.length > 0 || filteredPosts.length > 0

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.homeBackground }}>

      <PageDoodles variant="corners" />

      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          navLinks={[
            { label: 'Home',       to: '/home' },
            { label: 'Explore',    to: '#' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings',   to: '/settings' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="max-w-[860px] mx-auto w-full px-6 md:px-10 py-10">

          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: hexToRgba(theme.primary, 0.5) }}>
              Search Results
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              <span className="text-slate-400 font-bold text-3xl">Results for </span>
              <span className="italic" style={{ color: theme.primary }}>&ldquo;{urlQuery}&rdquo;</span>
            </h1>
            {!loading && (
              <p className="text-slate-400 font-bold mt-2 text-sm">
                {filteredAuthors.length + filteredPosts.length} result{(filteredAuthors.length + filteredPosts.length) !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Filter bar */}
          <div
            className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border-2 mb-8"
            style={{ backgroundColor: hexToRgba(theme.primary, 0.04), borderColor: hexToRgba(theme.primary, 0.12) }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Type</span>
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleTypeChange(f)}
                  className="text-sm font-black px-4 py-1.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95"
                  style={
                    typeFilter === f
                      ? { backgroundColor: theme.primary, color: '#fff', borderColor: theme.primary, boxShadow: `0 4px 10px ${hexToRgba(theme.primary, 0.3)}` }
                      : { backgroundColor: 'transparent', color: hexToRgba(theme.primary, 0.65), borderColor: hexToRgba(theme.primary, 0.2) }
                  }
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: hexToRgba(theme.primary, 0.15) }} />

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Origin</span>
              {ORIGIN_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleOriginChange(f)}
                  className="text-sm font-black px-4 py-1.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  style={
                    originFilter === f
                      ? { backgroundColor: theme.primary, color: '#fff', borderColor: theme.primary, boxShadow: `0 4px 10px ${hexToRgba(theme.primary, 0.3)}` }
                      : { backgroundColor: 'transparent', color: hexToRgba(theme.primary, 0.65), borderColor: hexToRgba(theme.primary, 0.2) }
                  }
                >
                  {f === 'AI'    && <span className="material-symbols-outlined text-[14px]">smart_toy</span>}
                  {f === 'Human' && <span className="material-symbols-outlined text-[14px]">person</span>}
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading && <SearchSkeleton theme={theme} />}

          {!loading && !hasResults && (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-7xl mb-4 block" style={{ color: hexToRgba(theme.primary, 0.2) }}>
                search_off
              </span>
              <p className="text-2xl font-extrabold text-slate-300 bouncy-text mb-2">Nothing found!</p>
              <p className="text-slate-400 text-sm">Try different keywords or remove a filter.</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-6 px-8 py-3 rounded-full font-extrabold text-white transition-all hover:scale-105"
                style={{ backgroundColor: theme.primary }}
              >
                Go Back
              </button>
            </div>
          )}

          {!loading && hasResults && (
            <div className="space-y-10">

              {filteredAuthors.length > 0 && (
                <section>
                  <SectionHeading icon="group" label="Authors" count={filteredAuthors.length} theme={theme} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredAuthors.map((a) => (
                      <AuthorCard
                        key={a._id}
                        author={a}
                        theme={theme}
                        onClick={() => {
                          const isAIAuthor = a?.isAI || a?.authorType === 'AI'
                          const identifier = a?.username
                          if (!identifier) return
                          navigate(`/profile/${encodeURIComponent(identifier)}?userType=${isAIAuthor ? 'AI' : 'human'}`)
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredAuthors.length > 0 && filteredPosts.length > 0 && (
                <div className="h-0.5 rounded-full" style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }} />
              )}

              {filteredPosts.length > 0 && (
                <section>
                  <SectionHeading icon="article" label="Blogs" count={filteredPosts.length} theme={theme} />
                  <div className="flex flex-col gap-3">
                    {filteredPosts.map((p) => {
                      const postIdentifier = getPostIdentifier(p)
                      return (
                        <BlogCard
                          key={postIdentifier || p._id || p.id || p.title}
                          post={p}
                          theme={theme}
                          onClick={() => {
                            if (!postIdentifier) return
                            navigate(`/blog/${postIdentifier}`, {
                              state: {
                                from: 'search',
                                backLabel: 'Search Results',
                                searchUrl: location.pathname + location.search,
                              }
                            })
                          }}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

            </div>
          )}

        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}