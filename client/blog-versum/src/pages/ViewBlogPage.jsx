import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Comments from '../components/comments'
import PageDoodles from '../components/shared/PageDoodles'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { usePostStore } from '../store/usePostStore'
import { useLikeStore } from '../store/useLikeStore'
import { useCommentStore } from '../store/useCommentStore'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'
import { getFallbackCoverImage } from '../lib/fallbackCoverImages'

// ─── Font registry ────────────────────────────────────────────────────────────
const FONT_MAP = {
  serif:   { label: 'Classic Serif',  style: 'Georgia, "Times New Roman", serif' },
  sans:    { label: 'Clean Sans',     style: '"Segoe UI", Helvetica, Arial, sans-serif' },
  mono:    { label: 'Typewriter',     style: '"Courier New", Courier, monospace' },
  cursive: { label: 'Handwritten',    style: '"Comic Sans MS", "Chalkboard SE", cursive' },
}
const getFont = (fontId) => FONT_MAP[fontId] || FONT_MAP.serif

// ─── Visibility badge ─────────────────────────────────────────────────────────
const VISIBILITY_BADGE = {
  public:    { label: 'Public',    icon: 'public', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  followers: { label: 'Followers', icon: 'group',  bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  private:   { label: 'Draft',     icon: 'lock',   bg: 'bg-slate-100 text-slate-600 border-slate-200' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ViewBlogSkeleton({ theme }) {
  const p = theme.primary
  return (
    <div className="animate-pulse max-w-[1100px] mx-auto px-6 md:px-10 pt-8 pb-20">
      <div className="w-full rounded-2xl mb-0" style={{ height: '420px', backgroundColor: hexToRgba(p, 0.1) }} />
      <div
        className="relative -mt-16 mx-4 rounded-2xl p-8 space-y-5"
        style={{ backgroundColor: theme.homeBackground, boxShadow: `0 8px 40px ${hexToRgba(p, 0.1)}` }}
      >
        <div className="flex gap-2">
          {[72, 56, 88, 64].map((w) => (
            <div key={w} className="h-5 rounded-full" style={{ width: w, backgroundColor: hexToRgba(p, 0.1) }} />
          ))}
        </div>
        <div className="space-y-3 pt-1">
          <div className="h-9 rounded-xl" style={{ width: '90%', backgroundColor: hexToRgba(p, 0.1) }} />
          <div className="h-9 rounded-xl" style={{ width: '65%', backgroundColor: hexToRgba(p, 0.07) }} />
        </div>
        <div className="h-4 rounded" style={{ width: '75%', backgroundColor: hexToRgba(p, 0.07) }} />
        <div className="flex gap-6 pt-1">
          {[90, 100, 80].map((w) => (
            <div key={w} className="h-3 rounded" style={{ width: w, backgroundColor: hexToRgba(p, 0.06) }} />
          ))}
        </div>
        <div className="h-px" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
        {[100, 96, 88, 100, 72, 94, 100, 84, 60, 100, 90, 78].map((w, i) => (
          <div key={i} className="h-4 rounded" style={{ width: `${w}%`, backgroundColor: hexToRgba(p, 0.05) }} />
        ))}
      </div>
    </div>
  )
}

// ─── Content renderer ─────────────────────────────────────────────────────────
function normalizeContentText(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          if (typeof item.text === 'string') return item.text
          if (typeof item.content === 'string') return item.content
        }
        return ''
      })
      .filter(Boolean)
      .join('\n\n')
  }
  if (content && typeof content === 'object') {
    if (typeof content.text === 'string') return content.text
    if (typeof content.content === 'string') return content.content
    if (Array.isArray(content.blocks)) {
      return content.blocks
        .map((block) => (typeof block?.text === 'string' ? block.text : ''))
        .filter(Boolean)
        .join('\n\n')
    }
  }
  return ''
}

function renderContent(rawContent, fontStyle) {
  const text = normalizeContentText(rawContent)
  if (!text) {
    return (
      <p className="mb-6 leading-[1.9] text-[17px] text-slate-500 dark:text-slate-400" style={{ fontFamily: fontStyle }}>
        No content available for this post.
      </p>
    )
  }

  return text.split('\n\n').map((para, i) => {
    const isHeading = para.startsWith('**') && para.endsWith('**') && !para.slice(2, -2).includes('**')
    if (isHeading) {
      return (
        <h2
          key={i}
          className="text-2xl font-extrabold mt-10 mb-4 text-slate-800 dark:text-slate-100"
          style={{ fontFamily: fontStyle }}
        >
          {para.slice(2, -2)}
        </h2>
      )
    }

    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
      chunk.startsWith('**') && chunk.endsWith('**')
        ? <strong key={j} className="font-bold text-slate-900 dark:text-white">{chunk.slice(2, -2)}</strong>
        : chunk
    )

    return (
      <p
        key={i}
        className="mb-6 leading-[1.9] text-[17px] text-slate-600 dark:text-slate-300"
        style={{ fontFamily: fontStyle }}
      >
        {parts}
      </p>
    )
  })
}

// ─── Page animations ─────────────────────────────────────────────────────────
const ANIM_STYLE = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.15s; }
  .fade-up-3 { animation-delay: 0.25s; }
  .fade-up-4 { animation-delay: 0.38s; }
`

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ViewBlogPage({ authUser }) {
  const navigate = useNavigate()
  const { id }   = useParams()
  const theme    = useThemeStore((state) => state.getTheme())

  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked,   setLiked]   = useState(false)
  const [comments, setComments] = useState([])
  const {isLiking, likePost, hasLiked, unlikePost} = useLikeStore();

  const { fetchPostById } = usePostStore()
  const { fetchCommentsByPost, postComment, deleteComment, isfetchingComments, isPostingComment } = useCommentStore()

  // Transform flat comments array into nested structure
  const transformComments = (flatComments) => {
    if (!Array.isArray(flatComments)) return []

    const commentMap = {}
    const topLevelComments = []

    // First pass: create a map of all comments
    flatComments.forEach((comment) => {
      commentMap[comment._id] = { ...comment, replies: [] }
    })

    // Second pass: organize into hierarchy
    flatComments.forEach((comment) => {
      if (comment.parentCommentId) {
        // This is a reply, add it to parent's replies array
        const parent = commentMap[comment.parentCommentId]
        if (parent) {
          parent.replies.push(commentMap[comment._id])
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentMap[comment._id])
      }
    })

    return topLevelComments
  }

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await unlikePost(post._id);
        setLiked(false);
        setPost(prev => ({
          ...prev,
          likeCount: prev.likeCount - 1
        }));
      } else {
        await likePost(post._id);
        setLiked(true);
        setPost(prev => ({
          ...prev,
          likeCount: prev.likeCount + 1
        }));
      } 
    } catch (error) {
      console.error('Error toggling like: ', error);
    }
  }

  useEffect(() => {
    if (!id) return

    const loadPostDetails = async () => {
      setLoading(true)
      setPost(null)
      setComments([])
      setLiked(false)

      try {
        const fetchedPost = await fetchPostById(id)

        if (!fetchedPost) return

        setPost(fetchedPost)

        // Fetch comments using the actual post ID (not slug)
        try {
          const fetchedComments = await fetchCommentsByPost(fetchedPost._id)
          setComments(transformComments(fetchedComments))
        } catch (error) {
          console.error('Failed to fetch comments', error)
        }

        try {
          const userLike = await hasLiked(fetchedPost._id)
          setLiked(Boolean(userLike))
        } catch (error) {
          console.error('Failed to fetch like status', error)
          setLiked(false)
        }
      } finally {
        setLoading(false)
      }
    }

    loadPostDetails()
  }, [id, fetchPostById, fetchCommentsByPost, hasLiked])

  const font  = getFont(post?.fontId)
  const badge = post ? (VISIBILITY_BADGE[post.visibility] || VISIBILITY_BADGE.private) : null
  const coverImage = post?.coverImage || getFallbackCoverImage(post?.slug || post?._id || post?.id || post?.title)

  const location = useLocation()
  const source = location.state?.from
  const isJournalSource = source === 'journal' || (!source && location.pathname.startsWith('/journal/'))
  const isSearchSource = source === 'search'
  const isProfileSource = source === 'profile'

  const backLabel = isSearchSource
    ? (location.state?.backLabel || 'Search Results')
    : isProfileSource
      ? (location.state?.backLabel || 'User Profile')
      : isJournalSource
        ? (location.state?.backLabel || 'My Journal')
        : 'Previous'

  const backUrl = isSearchSource
    ? (location.state?.searchUrl || '/search')
    : isProfileSource
      ? (location.state?.profileUrl || '/home')
      : isJournalSource
        ? (location.state?.journalUrl || '/journal')
        : null

  const handleBackNavigation = () => {
    if (backUrl) {
      navigate(backUrl)
      return
    }
    navigate(-1)
  }

  const handlePostComment = async ({ postId, content, parentCommentId }) => {
    try {
      const payload = { postId, content }
      // Only add parentCommentId if it exists (for replies)
      if (parentCommentId) {
        payload.parentCommentId = parentCommentId
      }

      await postComment(payload)
      // Refetch comments immediately after posting
      const updatedComments = await fetchCommentsByPost(postId)
      setComments(transformComments(updatedComments))
    } catch (error) {
      console.error('Failed to post comment', error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId)
      // Refetch comments immediately after deletion
      const updatedComments = await fetchCommentsByPost(post._id)
      setComments(transformComments(updatedComments))
    } catch (error) {
      console.error('Failed to delete comment', error)
    }
  }

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.homeBackground }}>
      <style>{ANIM_STYLE}</style>
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

        <main className="flex-1">
          {/* ── Loading ─────────────────────────────────────────────────── */}
          {loading && <ViewBlogSkeleton theme={theme} />}

          {/* ── Not found ───────────────────────────────────────────────── */}
          {!loading && !post && (
            <div className="text-center py-32">
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: hexToRgba(theme.primary, 0.3) }}>
                search_off
              </span>
              <p className="text-xl font-bold text-slate-400">Post not found.</p>
              <button
                onClick={handleBackNavigation}
                className="mt-6 px-8 py-3 rounded-full font-extrabold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Back to {backLabel}
              </button>
            </div>
          )}

          {/* ── Post ────────────────────────────────────────────────────── */}
          {!loading && post && (
            <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-8 pb-24">

              {/* Back button */}
              <div className="mb-5 fade-up fade-up-1">
                <button
                onClick={handleBackNavigation}
                className="inline-flex items-center gap-1.5 text-sm font-extrabold px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                style={{
                  color: theme.primary,
                  backgroundColor: hexToRgba(theme.primary, 0.08),
                  border: `2px solid ${hexToRgba(theme.primary, 0.18)}`,
                }}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to {backLabel}
              </button>
              </div>

              {/* ── Cinematic Banner ──────────────────────────────────────── */}
              <div
                className="fade-up fade-up-1 relative w-full rounded-2xl overflow-hidden shadow-2xl mb-0"
                style={{ height: '420px', boxShadow: `0 20px 60px ${hexToRgba(theme.primary, 0.18)}` }}
              >
                <img src={coverImage} alt={post.title} className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, transparent 45%, ${hexToRgba('#000', 0.45)} 100%)` }}
                />
               
              </div>

              {/* ── Floating content card ─────────────────────────────────── */}
              <div
                className="relative -mt-10 mx-2 rounded-2xl px-8 md:px-12 pt-9 pb-10 fade-up fade-up-2"
                style={{
                  backgroundColor: theme.homeBackground,
                  boxShadow: `0 8px 48px ${hexToRgba(theme.primary, 0.1)}, 0 1px 0 ${hexToRgba(theme.primary, 0.08)}`,
                  border: `1.5px solid ${hexToRgba(theme.primary, 0.09)}`,
                }}
              >
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {(post.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                      style={{
                        color: theme.primary,
                        border: `1.5px solid ${hexToRgba(theme.primary, 0.28)}`,
                        backgroundColor: hexToRgba(theme.primary, 0.06),
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1
                  className="text-3xl md:text-[2.6rem] font-extrabold leading-[1.2] tracking-tight text-slate-900 dark:text-white mb-3"
                  style={{ fontFamily: font.style }}
                >
                  {post.title}
                </h1>

                {/* Catchline */}
                {post.catchline && (
                  <p
                    className="text-base text-slate-500 dark:text-slate-400 italic mb-5 leading-relaxed"
                    style={{ fontFamily: font.style }}
                  >
                    {post.catchline}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <img src={post.author?.avatar || DEFAULT_AVATAR_URL} className="size-5 rounded-full object-cover" alt="" />
                    <span className="text-slate-500 dark:text-slate-400">{post.author?.username}</span>
                  </div>

                  <span className="text-slate-200 dark:text-slate-700">·</span>

                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {formatDate(post.createdAt)}
                  </span>

                  <span className="text-slate-200 dark:text-slate-700">·</span>

                  <span className="flex items-center gap-1" style={{ color: hexToRgba(theme.primary, 0.6) }}>
                    <span className="material-symbols-outlined text-[14px]">text_fields</span>
                    <span style={{ fontFamily: font.style }}>{font.label}</span>
                  </span>

                  <span className="text-slate-200 dark:text-slate-700">·</span>

                  {badge && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-black ${badge.bg}`}>
                      <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                      {badge.label}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="w-16 h-1 rounded-full mb-8" style={{ backgroundColor: theme.primary, opacity: 0.5 }} />

                {/* Body */}
                <div className="fade-up fade-up-3">
                  {renderContent(post.content, font.style)}
                </div>

                {/* Divider */}
                <div className="w-full h-px mt-10 mb-8 rounded-full" style={{ backgroundColor: hexToRgba(theme.primary, 0.12) }} />

                {/* Reactions bar */}
                <div className="fade-up fade-up-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={handleLikeToggle}
                      className="flex items-center gap-2 font-extrabold text-sm transition-all hover:scale-110 active:scale-95 select-none"
                      style={{ color: liked ? '#ef4444' : hexToRgba(theme.primary, 0.45) }}
                    >
                      <span
                        className="material-symbols-outlined text-[22px] transition-all"
                        style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      {formatCount((post.likeCount ?? 0))}
                    </button>

                    <button
                      className="flex items-center gap-2 font-extrabold text-sm transition-all hover:scale-110"
                      style={{ color: hexToRgba(theme.primary, 0.45) }}
                    >
                      <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                      {formatCount(post.commentCount ?? 0)}
                    </button>
                  </div>

                  {isJournalSource && (
                    <button
                      onClick={() => navigate('/journal')}
                      className="text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-100 opacity-50"
                      style={{ color: theme.primary }}
                    >
                      <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                      Back to My Journal
                    </button>
                  )}
                </div>
                  <Comments
                    comments={comments}
                    isFetchingComments={isfetchingComments}
                    isPostingComment={isPostingComment}
                    onPostComment={handlePostComment}
                    isAuthor={authUser?._id === post.author?._id}
                    currentUserId={authUser?._id}
                    authUserAvatar={authUser?.avatar || DEFAULT_AVATAR_URL}
                    onDeleteComment={handleDeleteComment}
                    postId={post._id}
                  />

              </div>
            </div>
          )}
        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}