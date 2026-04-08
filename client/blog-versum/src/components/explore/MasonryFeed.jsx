/**
 * MasonryFeed.jsx
 *
 * Pinterest-style masonry grid for explore blog posts.
 * Uses CSS columns (column-count) — no JS layout library needed.
 * Cards have variable heights because the excerpt and image heights differ.
 * Warm, cosy styling with hand-drawn, sketchy aesthetic.
 *
 * Props:
 *   posts     — array of post objects from mockexploredata
 *   topicColor — hex string for accent (bgFrom of active topic)
 */

import { useState } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { formatCount } from '../../lib/Mockexploredata'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'

/* Heights cycle so the masonry feels naturally varied */
const IMG_HEIGHTS = [180, 220, 160, 240, 200, 170, 230]

export default function MasonryFeed({ posts, topicColor, topicLabel }) {
  const theme = useThemeStore((state) => state.getTheme())
  const [liked, setLiked] = useState({})
  const [hovered, setHovered] = useState(null)

  const toggleLike = (e, id) => {
    e.stopPropagation()
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-slate-400 text-center py-20 font-medium">
        No posts yet for this topic.
      </p>
    )
  }

  const accent = topicColor || theme.primary

  return (
    <div
      style={{
        columnCount: 1,
        columnGap: '1.5rem',
      }}
      className="masonry-grid sm:columns-2 lg:columns-3"
    >
      {posts.map((post, idx) => {
        const imgH = IMG_HEIGHTS[idx % IMG_HEIGHTS.length]
        const isLiked = liked[post.id]
        const isHovered = hovered === post.id

        return (
          <article
            key={post.id}
            className="break-inside-avoid mb-6 bg-white dark:bg-slate-900 sketchy-card p-0 group cursor-pointer"
            style={{
              borderColor: hexToRgba(accent, 0.2),
              boxShadow: isHovered
                ? `0 8px 24px ${hexToRgba(accent, 0.15)}, 0 4px 0 ${hexToRgba(accent, 0.1)}`
                : `0 4px 12px ${hexToRgba(accent, 0.08)}`,
            }}
            onMouseEnter={() => setHovered(post.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {/* navigate to post in real impl */}}
          >
            {/* Cover image with sketchy border */}
            <div
              className="overflow-hidden relative border-b-2"
              style={{ height: imgH, borderColor: hexToRgba(accent, 0.15) }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Warm gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(180deg, transparent 60%, ${hexToRgba(accent, 0.3)} 100%)`,
                }}
              />
              {/* Tag pill overlay */}
              {post.tags?.[0] && (
                <span
                  className="absolute top-3 left-3 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide border-2"
                  style={{
                    backgroundColor: accent,
                    borderColor: hexToRgba('#fff', 0.3),
                    color: '#fff',
                  }}
                >
                  {post.tags[0]}
                </span>
              )}
              {/* Decorative corner doodle */}
              <svg
                className="absolute -top-1 -left-1 w-5 h-5 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
                style={{ opacity: 0.2 }}
              >
                <path
                  d="M2 18 L2 2 L18 2"
                  stroke={accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Card body */}
            <div className="p-5 space-y-3">
              {/* Read time */}
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: hexToRgba(accent, 0.5) }}
                >
                  schedule
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {post.readTime}
                </span>
              </div>

              {/* Title */}
              <h4
                className="font-extrabold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 bouncy-text transition-colors"
                style={{ color: isHovered ? accent : undefined }}
              >
                {post.title}
              </h4>

              {/* Catchline */}
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
                {post.catchline}
              </p>

              {/* Divider with sketchy dashed style */}
              <div
                className="border-t-2 border-dashed pt-3"
                style={{ borderColor: hexToRgba(accent, 0.1) }}
              />

              {/* Footer: author + stats */}
              <div className="flex items-center justify-between">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0"
                    style={{ borderColor: hexToRgba(accent, 0.2) }}
                  >
                    <img
                      src={post.authorAvatar || DEFAULT_AVATAR_URL}
                      alt={post.author}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                    {post.author}
                  </span>
                </div>

                {/* Likes & comments */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => toggleLike(e, post.id)}
                    className="flex items-center gap-1 transition-all hover:scale-110"
                    style={{ color: isLiked ? '#e57373' : (isHovered ? '#e57373' : '#94a3b8') }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      favorite
                    </span>
                    <span className="text-xs font-bold">
                      {formatCount(post.likes + (isLiked ? 1 : 0))}
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-1 transition-colors"
                    style={{ color: isHovered ? accent : '#94a3b8' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    <span className="text-xs font-bold">{formatCount(post.comments)}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
