import { hexToRgba } from '../../store/themeConfig'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'

const formatDate = (iso) => {
  const now = new Date()
  const d = new Date(iso)
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Replies have NO reply button (can't reply to a reply) and NO likes.
// Delete icon appears on hover only if isAuthor=true AND reply belongs to currentUserId.
export default function ReplyItem({ reply, theme, isAuthor, currentUserId, onDeleteReply, delayIndex = 0 }) {
  const isOwnReply = isAuthor && currentUserId && reply.authorId._id === currentUserId

  return (
    <div
      className="reply-slide flex gap-2.5 group"
      style={{ animationDelay: `${delayIndex * 0.06}s` }}
    >
      {/* Avatar */}
      <img
        src={reply.authorId.avatar || DEFAULT_AVATAR_URL}
        alt={reply.authorId.username}
        className="size-7 rounded-full object-cover flex-shrink-0 mt-0.5"
        style={{ outline: `2px solid ${hexToRgba(theme.primary, 0.2)}`, outlineOffset: '1px' }}
      />

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div
          className="rounded-xl rounded-tl-sm px-3.5 py-2.5"
          style={{
            backgroundColor: hexToRgba(theme.primary, 0.05),
            border: `1.5px solid ${hexToRgba(theme.primary, 0.1)}`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black" style={{ color: theme.primary }}>
                @{reply.authorId.username}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {formatDate(reply.createdAt)}
              </span>
            </div>

            {/* Delete — hover-revealed, only for own replies when isAuthor */}
            {isOwnReply && (
              <button
                onClick={() => onDeleteReply(reply._id)}
                className="flex items-center gap-0.5 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-red-500 flex-shrink-0"
                style={{ color: hexToRgba(theme.primary, 0.35) }}
                title="Delete reply"
              >
                <span className="material-symbols-outlined text-[13px]">delete</span>
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mt-1.5">{reply.content}</p>
        </div>
      </div>
    </div>
  )
}