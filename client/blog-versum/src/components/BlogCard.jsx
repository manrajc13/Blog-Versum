import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { useState } from 'react'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'

// ─── Font registry (mirrors MyJournal / backend fontId values) ───────────────
const FONT_MAP = {
  serif:   { label: 'Classic Serif',  style: 'Georgia, "Times New Roman", serif' },
  sans:    { label: 'Clean Sans',     style: '"Segoe UI", Helvetica, Arial, sans-serif' },
  mono:    { label: 'Typewriter',     style: '"Courier New", Courier, monospace' },
  cursive: { label: 'Handwritten',    style: '"Comic Sans MS", "Chalkboard SE", cursive' },
}
const DEFAULT_FONT = FONT_MAP.serif
const getFont = (fontId) => FONT_MAP[fontId] || DEFAULT_FONT

// ─── Visibility badge config ──────────────────────────────────────────────────
const VISIBILITY_BADGE = {
  public:    { label: 'Public',    icon: 'public', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  followers: { label: 'Followers', icon: 'group',  bg: 'bg-blue-100 text-blue-700 border-blue-200' },
  private:   { label: 'Draft',     icon: 'lock',   bg: 'bg-slate-100 text-slate-600 border-slate-200' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * BlogCard — dual-mode card component with sketchy hand-drawn style
 *
 * variant="home"    (default)  — standard feed card; uses static props
 * variant="journal"            — author's post card; reads from `post` object,
 *                                shows visibility, tags, font, date & action menu
 */
export default function BlogCard({
  // ── home-mode props ──────────────────────────────────────────────────────────
  variant = 'home',
  category,
  categoryVariant = 'purple',
  readTime,
  title,
  excerpt,
  author,
  authorAvatarUrl,
  authorTypeLabel,
  authorBgColor = 'bg-accent-teal',
  likes,
  comments,
  image,
  onClick,
  // ── journal-mode props ───────────────────────────────────────────────────────
  post,           // full post object from usePostStore
  activeMenu,     // post._id | null
  setActiveMenu,  // setter
  onView,         // () => void
  onEdit,         // () => void
  onDelete,       // () => void
}) {
  const theme = useThemeStore((state) => state.getTheme())
  const navigate = useNavigate()

  const [hovered, setHovered] = useState(false)

  // ── journal-mode derived values ──────────────────────────────────────────────
  const isJournal = variant === 'journal'
  const font      = isJournal ? getFont(post?.fontId) : DEFAULT_FONT
  const badge     = isJournal ? (VISIBILITY_BADGE[post?.visibility] || VISIBILITY_BADGE.private) : null

  // ── resolve display values ────────────────────────────────────────────────────
  const displayTitle    = isJournal ? post?.title         : title
  const displayExcerpt  = isJournal ? (post?.catchline || '') : excerpt
  const displayImage    = isJournal ? post?.coverImage    : image
  const displayReadTime = isJournal ? `${post?.readTime ?? 0} min` : readTime
  const displayLikes    = isJournal
    ? ((post?.likeCount ?? 0) > 0 ? formatCount(post.likeCount) : '—')
    : likes
  const displayComments = isJournal
    ? ((post?.commentCount ?? 0) > 0 ? formatCount(post.commentCount) : '—')
    : comments

  return (
    <article
      className="bg-white dark:bg-slate-900 sketchy-card p-5 md:p-6 group cursor-pointer"
      style={{
        borderColor: hexToRgba(theme.primary, 0.2),
        boxShadow: hovered
          ? `0 8px 24px ${hexToRgba(theme.primary, 0.15)}, 0 4px 0 ${hexToRgba(theme.primary, 0.1)}`
          : `0 4px 12px ${hexToRgba(theme.primary, 0.08)}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row gap-5">

        {/* ── Thumbnail with sketchy border ──────────────────────────────────── */}
        <div
          className="w-full md:w-56 h-44 rounded-xl overflow-hidden flex-shrink-0 relative border-2"
          style={{
            borderColor: hexToRgba(theme.primary, 0.15),
            backgroundColor: isJournal && !displayImage ? hexToRgba(theme.primary, 0.05) : undefined,
          }}
        >
          {displayImage ? (
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src={displayImage}
              alt={displayTitle}
            />
          ) : isJournal ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: hexToRgba(theme.primary, 0.25) }}
              >
                image
              </span>
            </div>
          ) : null}

          {/* Decorative corner doodle */}
          <svg
            className="absolute -top-1 -left-1 w-6 h-6 pointer-events-none"
            viewBox="0 0 20 20"
            fill="none"
            style={{ opacity: 0.2 }}
          >
            <path
              d="M2 18 L2 2 L18 2"
              stroke={theme.primary}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-2.5 min-w-0">

          {/* Top row: category/badge + read time + (journal: action menu) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isJournal ? (
                /* Visibility badge */
                badge && (
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-black ${badge.bg}`}>
                    <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                    {badge.label}
                  </span>
                )
              ) : (
                /* Category pill with sketchy style */
                <span
                  className="text-xs font-black px-3 py-1 rounded-full uppercase border-2"
                  style={{
                    backgroundColor: hexToRgba(theme.primary, 0.08),
                    borderColor: hexToRgba(theme.primary, 0.2),
                    color: theme.primary,
                  }}
                >
                  {category}
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                <span className="material-symbols-outlined text-sm" style={{ color: hexToRgba(theme.primary, 0.5) }}>
                  schedule
                </span>
                {displayReadTime}
              </span>
            </div>

            {/* Journal-mode: action menu */}
            {isJournal && (
              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenu(activeMenu === post._id ? null : post._id)
                  }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: hovered ? hexToRgba(theme.primary, 0.08) : 'transparent',
                    color: hovered ? theme.primary : '#94a3b8',
                  }}
                >
                  <span className="material-symbols-outlined text-xl">more_horiz</span>
                </button>

                {activeMenu === post._id && (
                  <div
                    className="absolute right-0 top-10 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-[999] overflow-hidden border-2"
                    style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onView?.() }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      style={{ color: theme.primary }}
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit?.() }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      style={{ color: theme.primary }}
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Edit
                    </button>
                    <div
                      className="h-px mx-3"
                      style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-xl md:text-2xl font-extrabold bouncy-text transition-colors line-clamp-2"
            style={{
              ...(isJournal ? { fontFamily: font.style } : {}),
              color: hovered ? theme.primary : undefined,
            }}
          >
            {displayTitle}
          </h3>

          {/* Excerpt / catchline */}
          <p
            className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed"
            style={isJournal ? { fontFamily: font.style } : {}}
          >
            {displayExcerpt}
          </p>

          {/* Journal-mode: tags row */}
          {isJournal && (post?.tags?.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border-2"
                  style={{
                    color: theme.primary,
                    borderColor: hexToRgba(theme.primary, 0.2),
                    backgroundColor: hexToRgba(theme.primary, 0.05),
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider with sketchy style */}
          <div
            className="border-t-2 border-dashed pt-3 mt-1"
            style={{ borderColor: hexToRgba(theme.primary, 0.1) }}
          />

          {/* Footer row */}
          <div className="flex items-center justify-between flex-wrap gap-y-2">

            {/* Left: author (home) OR font pill (journal) */}
            {isJournal ? (
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs"
                style={{
                  borderColor: hexToRgba(theme.primary, 0.15),
                  backgroundColor: hexToRgba(theme.primary, 0.04),
                  color: hexToRgba(theme.primary, 0.8),
                }}
                title={`Written in ${font.label}`}
              >
                <span className="material-symbols-outlined text-sm">text_fields</span>
                <span style={{ fontFamily: font.style }} className="font-black">{font.label}</span>
              </span>
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer group/author"
                onClick={(e) => {
                  e.stopPropagation();
                  const target = author;
                  if (!target) return
                  navigate(`/profile/${target}`)
                }}
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0"
                  style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
                >
                  <img
                    src={authorAvatarUrl || DEFAULT_AVATAR_URL}
                    alt={author ? `${author} avatar` : 'Author avatar'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="font-bold text-sm group-hover/author:underline">{author}</span>
                {authorTypeLabel && (
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full border-2"
                    style={{
                      backgroundColor: hexToRgba(theme.primary, 0.05),
                      borderColor: hexToRgba(theme.primary, 0.15),
                      color: theme.primary,
                    }}
                  >
                    {authorTypeLabel}
                  </span>
                )}
              </div>
            )}

            {/* Right: likes + comments + (journal: date) */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-1 transition-colors"
                style={{ color: hovered ? '#e57373' : '#94a3b8' }}
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                <span className="font-bold text-sm">{displayLikes}</span>
              </button>
              <button
                className="flex items-center gap-1 transition-colors"
                style={{ color: hovered ? theme.primary : '#94a3b8' }}
              >
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                <span className="font-bold text-sm">{displayComments}</span>
              </button>
              {isJournal && (
                <span className="text-xs text-slate-300 font-bold shrink-0">
                  {formatDate(post?.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
