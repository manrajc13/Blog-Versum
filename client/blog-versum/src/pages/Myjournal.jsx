import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'          // ← now used here too
import PageDoodles from '../components/shared/PageDoodles'
import { toast } from 'react-hot-toast'
import { DeletePostConfirmToast } from '../components/toasts/DeletePostConfirmToast'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { usePostStore } from '../store/usePostStore'

const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const FILTER_TABS = ['All', 'Public', 'Followers', 'Drafts']

export default function MyJournal({ authUser }) {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeMenu, setActiveMenu] = useState(null)

  const { fetchMyPosts, isFetchingPosts, deletePost, posts } = usePostStore()

  useEffect(() => { 
    fetchMyPosts()
    console.log(posts);
   }, [fetchMyPosts])

  const totalLikes    = posts.reduce((sum, p) => sum + (p.likeCount    ?? 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount ?? 0), 0)
  const totalDrafts   = posts.filter((p) => !p.published || p.visibility === 'private').length

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'All')       return true
    if (activeFilter === 'Public')    return p.visibility === 'public'
    if (activeFilter === 'Followers') return p.visibility === 'followers'
    if (activeFilter === 'Drafts')    return p.visibility === 'private' || !p.published
    return true
  })

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.homeBackground }}>

      {/* Centralized hand-drawn doodles */}
      <PageDoodles variant="sparse" />

      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          activeLink="My Journal"
          navLinks={[
            { label: 'Home',       to: '/home' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings',   to: '/settings' },
            { label : 'Explore', to: '/explore'}
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="max-w-[1100px] mx-auto w-full px-6 md:px-10 py-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: hexToRgba(theme.primary, 0.6) }}>
                Your Writing Space
              </p>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                My{' '}
                <span className="italic relative inline-block" style={{ color: theme.primary }}>
                  Journal
                  <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full opacity-40" style={{ backgroundColor: theme.primary }} />
                </span>
              </h1>
              {isFetchingPosts ? (
                <p className="text-slate-400 font-medium mt-3 animate-pulse">Loading your stories…</p>
              ) : (
                <p className="text-slate-500 font-medium mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span><span className="font-black" style={{ color: theme.primary }}>{posts.length}</span> stories written</span>
                  <span className="text-slate-300">·</span>
                  <span><span className="font-black" style={{ color: theme.primary }}>{totalDrafts}</span> draft{totalDrafts !== 1 ? 's' : ''} tucked away</span>
                  <span className="text-slate-300">·</span>
                  <span><span className="font-black" style={{ color: theme.primary }}>{formatCount(totalLikes)}</span> likes</span>
                  <span className="text-slate-300">·</span>
                  <span><span className="font-black" style={{ color: theme.primary }}>{formatCount(totalComments)}</span> comments</span>
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/journal/create')}
              className="group flex items-center gap-3 text-white font-extrabold py-4 px-8 rounded-full transition-all active:translate-y-1 active:shadow-none shrink-0"
              style={{ backgroundColor: theme.primary, boxShadow: `0 6px 0 ${hexToRgba(theme.primary, 0.5)}` }}
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">edit_square</span>
              New Post
            </button>
          </div>

          {/* Stats strip */}
          <div
            className="grid grid-cols-3 gap-4 rounded-2xl p-5 mb-10 border-2"
            style={{ backgroundColor: hexToRgba(theme.primary, 0.06), borderColor: hexToRgba(theme.primary, 0.15) }}
          >
            {[
              { icon: 'article',     label: 'Total Posts',    value: posts.length },
              { icon: 'favorite',    label: 'Total Likes',    value: formatCount(totalLikes) },
              { icon: 'chat_bubble', label: 'Total Comments', value: formatCount(totalComments) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="text-center">
                <span className="material-symbols-outlined text-2xl block mb-1" style={{ color: theme.primary }}>{icon}</span>
                <p className={`text-2xl font-black ${isFetchingPosts ? 'animate-pulse opacity-40' : ''}`} style={{ color: theme.primary }}>
                  {isFetchingPosts ? '—' : value}
                </p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap mb-8 border-b-2 pb-4" style={{ borderColor: hexToRgba(theme.primary, 0.15) }}>
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="px-5 py-2 rounded-full font-bold text-sm transition-all border-2"
                style={
                  activeFilter === tab
                    ? { backgroundColor: theme.primary, color: '#fff', borderColor: theme.primary, boxShadow: `0 4px 12px ${hexToRgba(theme.primary, 0.3)}` }
                    : { backgroundColor: 'transparent', color: hexToRgba(theme.primary, 0.7), borderColor: hexToRgba(theme.primary, 0.2) }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {isFetchingPosts && (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-5 rounded-2xl border-2 overflow-hidden bg-white dark:bg-slate-900 animate-pulse" style={{ borderColor: hexToRgba(theme.primary, 0.08) }}>
                  <div className="w-36 md:w-48 shrink-0 h-36" style={{ backgroundColor: hexToRgba(theme.primary, 0.08) }} />
                  <div className="flex-1 py-5 pr-5 space-y-3">
                    <div className="h-5 rounded-lg w-2/3"   style={{ backgroundColor: hexToRgba(theme.primary, 0.08) }} />
                    <div className="h-3 rounded w-full"     style={{ backgroundColor: hexToRgba(theme.primary, 0.05) }} />
                    <div className="h-3 rounded w-4/5"      style={{ backgroundColor: hexToRgba(theme.primary, 0.05) }} />
                    <div className="h-3 rounded w-1/3 mt-4" style={{ backgroundColor: hexToRgba(theme.primary, 0.06) }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isFetchingPosts && filteredPosts.length === 0 && (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: hexToRgba(theme.primary, 0.3) }}>auto_stories</span>
              <p className="text-xl font-bold text-slate-400">No posts here yet.</p>
              <p className="text-slate-400 text-sm mt-1">Start writing your first story!</p>
              <button onClick={() => navigate('/journal/create')} className="mt-6 px-8 py-3 rounded-full font-extrabold text-white transition-all" style={{ backgroundColor: theme.primary }}>
                Write Something
              </button>
            </div>
          )}

          {/* ── Post Cards via BlogCard (journal variant) ──────────────────── */}
          {!isFetchingPosts && filteredPosts.length > 0 && (
            <div className="space-y-5">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post._id}
                  variant="journal"
                  post={post}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  onClick={() =>
                    navigate(`/journal/${post.slug || post._id}`, {
                      state: { from: 'journal', backLabel: 'My Journal', journalUrl: '/journal' },
                    })
                  }
                  onView={() => {
                    setActiveMenu(null)
                    navigate(`/journal/${post.slug || post._id}`, {
                      state: { from: 'journal', backLabel: 'My Journal', journalUrl: '/journal' },
                    })
                  }}
                  onEdit={() => {
                    setActiveMenu(null)
                    navigate(`/journal/edit/${post._id}`)
                  }}
                  onDelete={() => {
                    setActiveMenu(null)
                    toast.custom((t) => (
                      <DeletePostConfirmToast
                        borderColor={hexToRgba(theme.primary, 0.2)}
                        onCancel={() => toast.dismiss(t.id)}
                        onConfirm={async () => {
                          toast.dismiss(t.id)
                          await deletePost(post._id)
                        }}
                      />
                    ))
                  }}
                />
              ))}
            </div>
          )}

        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}