import { hexToRgba } from '../store/themeConfig'
import { useNavigate, useLocation } from 'react-router-dom'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'

const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

const getPostIdentifier = (post) => post?.slug || post?._id || post?.id || null


function AuthorRow({ author, iconColor, onClose }) {
  const navigate = useNavigate()

  const handleClick = () => {
    const isAIAuthor = author?.isAI || author?.authorType === 'AI'
    const identifier = author?.username
    if (!identifier) return
    onClose?.()
    navigate(`/profile/${encodeURIComponent(identifier)}?userType=${isAIAuthor ? 'AI' : 'human'}`)
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all rounded-xl mx-1"
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.06)}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div
        className="size-8 rounded-full overflow-hidden border-2 shrink-0 flex items-center justify-center text-white text-xs font-black"
        style={{
          borderColor: hexToRgba(iconColor, 0.3),
          backgroundColor: 'transparent',
        }}
      >
        <img src={author.avatar || DEFAULT_AVATAR_URL} alt={author.username} className="w-full h-full object-cover" />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">
        {author.username}
      </span>
      <span
        className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0"
        style={
          author.isAI
            ? { color: '#7c3aed', backgroundColor: '#ede9fe', borderColor: '#c4b5fd' }
            : { color: '#0369a1', backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }
        }
      >
        <span className="material-symbols-outlined text-[11px]">{author.isAI ? 'smart_toy' : 'person'}</span>
        {author.isAI ? 'AI' : 'Human'}
      </span>
    </div>
  )
}

function BlogRow({ post, iconColor, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
    const postIdentifier = getPostIdentifier(post)
    if (!postIdentifier) return
        onClose(); // Close the dropdown
    navigate(`/blog/${postIdentifier}`, {
      state : {
        from : 'search',
        backLabel: 'Search Results',
        searchUrl: `${location.pathname}${location.search}`,
      }
    }); // Navigate to the blog post page
    }
  return (
    <div
        onClick={handleClick}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all rounded-xl mx-1"
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hexToRgba(iconColor, 0.06)}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div
        className="size-9 rounded-lg overflow-hidden border-2 shrink-0 flex items-center justify-center"
        style={{ borderColor: hexToRgba(iconColor, 0.2), backgroundColor: hexToRgba(iconColor, 0.07) }}
      >
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          : <span className="material-symbols-outlined text-[16px]" style={{ color: hexToRgba(iconColor, 0.4) }}>article</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{post.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-slate-400 font-medium truncate">{post.author.username}</span>
          <span className="text-slate-200 text-[10px]">·</span>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5 shrink-0">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            {post.readTime} min
          </span>
        </div>
      </div>
      <span
        className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0"
        style={
          post.isAI
            ? { color: '#7c3aed', backgroundColor: '#ede9fe', borderColor: '#c4b5fd' }
            : { color: '#0369a1', backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' }
        }
      >
        <span className="material-symbols-outlined text-[11px]">{post.isAI ? 'smart_toy' : 'person'}</span>
        {post.isAI ? 'AI' : 'Human'}
      </span>
    </div>
  )
}

function SectionHeader({ icon, label, count, iconColor }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 border-b"
      style={{ borderColor: hexToRgba(iconColor, 0.1) }}
    >
      <span className="material-symbols-outlined text-[16px]" style={{ color: iconColor }}>{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest" style={{ color: hexToRgba(iconColor, 0.7) }}>
        {label}
      </span>
      <span
        className="ml-auto text-[11px] font-black px-2 py-0.5 rounded-full"
        style={{ backgroundColor: hexToRgba(iconColor, 0.1), color: iconColor }}
      >
        {count}
      </span>
    </div>
  )
}

export default function SearchResultsDropdown({
  authors, posts, hasResults, query, iconColor, typeFilter, onClose, onSeeAll,
}) {
  return (
    <div
      className="absolute top-[calc(100%+10px)] left-0 w-[420px] rounded-2xl border-2 overflow-hidden z-[999]"
      style={{
        backgroundColor: 'white',
        borderColor: hexToRgba(iconColor, 0.18),
        boxShadow: `0 12px 40px ${hexToRgba(iconColor, 0.15)}, 0 2px 8px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ backgroundColor: hexToRgba(iconColor, 0.04), borderColor: hexToRgba(iconColor, 0.1) }}
      >
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Results for &ldquo;{query}&rdquo;
        </span>
        <button onClick={onClose} style={{ color: hexToRgba(iconColor, 0.4) }}>
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* No results */}
      {!hasResults && (
        <div className="py-10 text-center">
          <span className="material-symbols-outlined text-4xl block mb-2" style={{ color: hexToRgba(iconColor, 0.25) }}>
            search_off
          </span>
          <p className="text-sm font-bold text-slate-400">Nothing found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-slate-300 mt-1">Try different keywords or filters</p>
        </div>
      )}

      {/* Authors */}
      {authors.length > 0 && (
        <div>
          <SectionHeader icon="group" label="Authors" count={authors.length} iconColor={iconColor} />
          <div className="py-1 max-h-[200px] overflow-y-auto">
            {authors.map((a) => <AuthorRow key={a._id} author={a} iconColor={iconColor} onClose={onClose} />)}
          </div>
        </div>
      )}

      {authors.length > 0 && posts.length > 0 && (
        <div className="h-px mx-4" style={{ backgroundColor: hexToRgba(iconColor, 0.08) }} />
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div>
          <SectionHeader icon="article" label="Blogs" count={posts.length} iconColor={iconColor} />
          <div className="py-1 max-h-[240px] overflow-y-auto">
            {posts.map((p) => <BlogRow key={p._id} post={p} iconColor={iconColor} onClose={onClose} />)}
          </div>
        </div>
      )}

      {/* Footer — See all results button */}
      {hasResults && (
        <div
          className="border-t"
          style={{ borderColor: hexToRgba(iconColor, 0.1) }}
        >
          <button
            onClick={onSeeAll}
            className="w-full py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{
              backgroundColor: hexToRgba(iconColor, 0.05),
              color: iconColor,
            }}
          >
            <span className="material-symbols-outlined text-[15px]">open_in_full</span>
            See all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  )
}