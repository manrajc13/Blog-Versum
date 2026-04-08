import { useState, useEffect } from 'react'
import { hexToRgba } from '../../store/themeConfig'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'
import ReplyItem from './ReplyItem'

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

// Top-level comment only. Has Reply button. No likes anywhere.
// Delete appears on hover only if isAuthor=true AND comment belongs to currentUserId.
export default function CommentItem({
  comment,
  theme,
  isAuthor,
  currentUserId,
  authUserAvatar = DEFAULT_AVATAR_URL,
  onDeleteComment,
  onPostReply,
  delayIndex = 0
}) {
  const [showReplies, setShowReplies]       = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText]           = useState('')
  const [localReplies, setLocalReplies]     = useState(comment.replies || [])

  const isOwnComment = isAuthor && currentUserId && comment.authorId._id === currentUserId
  const replyCount   = localReplies.length

  // Sync localReplies with comment.replies when it changes (after refetch)
  useEffect(() => {
    setLocalReplies(comment.replies || [])
  }, [comment.replies])

  const handleReplySubmit = async () => {
    const trimmed = replyText.trim()
    if (!trimmed || !onPostReply) return

    // Call API to post reply with parentCommentId
    await onPostReply({
      content: trimmed,
      parentCommentId: comment._id,
    })

    setReplyText('')
    setShowReplyInput(false)
    setShowReplies(true) // auto-expand so the user sees their reply land
  }

  const handleDeleteReply = async (replyId) => {
    if (!onDeleteComment) return
    // Use the same delete API for replies (they're just comments with parentCommentId)
    await onDeleteComment(replyId)
  }

  return (
    <div className="comment-in" style={{ animationDelay: `${delayIndex * 0.09}s` }}>
      <div className="flex gap-3 group">

        {/* Avatar + optional thread line */}
        <div className="flex flex-col items-center">
          <img
            src={comment.authorId.avatar || DEFAULT_AVATAR_URL}
            alt={comment.authorId.username}
            className="size-9 rounded-full object-cover flex-shrink-0 transition-transform hover:scale-105"
            style={{ outline: `2.5px solid ${hexToRgba(theme.primary, 0.28)}`, outlineOffset: '2px' }}
          />
          {showReplies && replyCount > 0 && (
            <div
              className="w-0.5 flex-1 mt-2 rounded-full"
              style={{ backgroundColor: hexToRgba(theme.primary, 0.15), minHeight: '16px' }}
            />
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">

          {/* Comment card */}
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3.5"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.04),
              border: `2px solid ${hexToRgba(theme.primary, 0.12)}`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black" style={{ color: theme.primary }}>
                  @{comment.authorId.username}
                </span>
                {isOwnComment && (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: hexToRgba(theme.primary, 0.12),
                      color: theme.primary,
                    }}
                  >
                    You
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-semibold">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Delete — hover-revealed, own comments only when isAuthor */}
              {isAuthor && (
                <button
                  onClick={() => onDeleteComment(comment._id)}
                  className="flex items-center gap-0.5 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-red-500 flex-shrink-0"
                  style={{ color: hexToRgba(theme.primary, 0.35) }}
                  title="Delete comment"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              )}
            </div>

            {/* Body */}
            <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-4 mt-2 px-1">

            {/* Reply — only available on top-level comments */}
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-black transition-all hover:scale-105 active:scale-95"
              style={{ color: showReplyInput ? theme.primary : hexToRgba(theme.primary, 0.4) }}
            >
              <span className="material-symbols-outlined text-[16px]">reply</span>
              Reply
            </button>

            {/* Show / hide replies toggle */}
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 text-xs font-black transition-all hover:scale-105 active:scale-95"
                style={{ color: hexToRgba(theme.primary, 0.55) }}
              >
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={{
                    display: 'inline-block',
                    transform: showReplies ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.22s ease',
                  }}
                >
                  expand_more
                </span>
                {showReplies
                  ? 'Hide replies'
                  : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {showReplyInput && (
            <div className="mt-3 ml-1 flex gap-2.5 input-reveal">
              <img
                src={authUserAvatar}
                alt="you"
                className="size-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 flex gap-2">
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplySubmit() }
                    if (e.key === 'Escape') { setShowReplyInput(false); setReplyText('') }
                  }}
                  placeholder={`Replying to @${comment.authorId.username}…`}
                  className="flex-1 text-sm px-3.5 py-2 rounded-full outline-none transition-all"
                  style={{
                    backgroundColor: hexToRgba(theme.primary, 0.05),
                    border: `2px solid ${hexToRgba(theme.primary, 0.18)}`,
                    color: '#334155',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = hexToRgba(theme.primary, 0.5)
                    e.target.style.boxShadow   = `0 0 0 3px ${hexToRgba(theme.primary, 0.09)}`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = hexToRgba(theme.primary, 0.18)
                    e.target.style.boxShadow   = 'none'
                  }}
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="px-3 py-2 rounded-full text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: theme.primary }}
                  title="Send reply"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
                <button
                  onClick={() => { setShowReplyInput(false); setReplyText('') }}
                  className="px-3 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: hexToRgba(theme.primary, 0.07),
                    color: hexToRgba(theme.primary, 0.6),
                  }}
                  title="Cancel"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Replies list — collapsed by default */}
          {showReplies && replyCount > 0 && (
            <div className="mt-3 ml-1 space-y-3">
              {localReplies.map((reply, i) => (
                <ReplyItem
                  key={reply._id}
                  reply={reply}
                  theme={theme}
                  isAuthor={isAuthor}
                  currentUserId={currentUserId}
                  onDeleteReply={handleDeleteReply}
                  delayIndex={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}