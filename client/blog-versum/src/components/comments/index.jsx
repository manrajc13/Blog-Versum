import { useState, useEffect } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { DEFAULT_AVATAR_URL } from '../../lib/defaultAvatar'
import CommentItem from './CommentItem'

// ─── Animations ───────────────────────────────────────────────────────────────
const COMMENT_ANIM = `
  @keyframes commentIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes replySlide {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes inputReveal {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .comment-in   { animation: commentIn   0.42s cubic-bezier(.22,1,.36,1) both; }
  .reply-slide  { animation: replySlide  0.28s cubic-bezier(.22,1,.36,1) both; }
  .input-reveal { animation: inputReveal 0.22s cubic-bezier(.22,1,.36,1) both; }
`

// ─── CommentSkeleton ──────────────────────────────────────────────────────────
function CommentSkeleton({ theme, count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-3">
          {/* Avatar skeleton */}
          <div
            className="size-9 rounded-full flex-shrink-0"
            style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
          />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div
              className="rounded-2xl rounded-tl-sm p-4 space-y-2.5"
              style={{
                backgroundColor: hexToRgba(theme.primary, 0.04),
                border: `2px solid ${hexToRgba(theme.primary, 0.12)}`,
              }}
            >
              {/* Header skeleton */}
              <div className="flex items-center gap-2">
                <div
                  className="h-3.5 rounded-full"
                  style={{ width: '90px', backgroundColor: hexToRgba(theme.primary, 0.15) }}
                />
                <div
                  className="h-3 rounded-full"
                  style={{ width: '60px', backgroundColor: hexToRgba(theme.primary, 0.08) }}
                />
              </div>

              {/* Content skeleton */}
              <div className="space-y-1.5">
                <div
                  className="h-3 rounded"
                  style={{ width: '100%', backgroundColor: hexToRgba(theme.primary, 0.08) }}
                />
                <div
                  className="h-3 rounded"
                  style={{ width: '85%', backgroundColor: hexToRgba(theme.primary, 0.06) }}
                />
              </div>
            </div>

            {/* Action row skeleton */}
            <div className="flex items-center gap-4 px-1">
              <div
                className="h-3 rounded-full"
                style={{ width: '50px', backgroundColor: hexToRgba(theme.primary, 0.08) }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Comments Component ──────────────────────────────────────────────────
/**
 * Props
 * ─────────────────────────────────────────────────────────────────────────────
 * comments         {Array}   Comment objects fetched from API
 * isFetchingComments {boolean} Loading state for fetching comments
 * isPostingComment {boolean} Loading state for posting a comment
 * onPostComment    {Function} Callback to post a comment (receives { postId, content })
 * onDeleteComment  {Function} Callback to delete a comment (receives commentId)
 * isAuthor         {boolean}  When true, delete icon appears for user's own comments
 * currentUserId    {string}   _id of the logged-in user
 * authUserAvatar   {string}   Avatar URL of the logged-in user
 * postId           {string}   ID of the post
 */
export default function Comments({
  comments = [],
  isFetchingComments = false,
  isPostingComment = false,
  onPostComment,
  onDeleteComment,
  isAuthor = false,
  currentUserId = null,
  authUserAvatar = DEFAULT_AVATAR_URL,
  postId,
}) {
  const theme = useThemeStore((state) => state.getTheme())

  const [localComments, setLocalComments] = useState(comments)
  const [newComment, setNewComment]       = useState('')

  // Update localComments when comments prop changes
  useEffect(() => {
    setLocalComments(comments)
  }, [comments])

  const handleDeleteComment = async (commentId) => {
    if (!onDeleteComment) return
    // Call the API delete handler from parent
    await onDeleteComment(commentId)
  }

  const handleSubmitComment = async () => {
    const trimmed = newComment.trim()
    if (!trimmed || isPostingComment || !onPostComment) return

    await onPostComment({ postId, content: trimmed })
    setNewComment('')
  }

  const handlePostReply = async ({ content, parentCommentId }) => {
    if (!onPostComment) return
    // Post reply with parentCommentId
    await onPostComment({ postId, content, parentCommentId })
  }

  return (
    <section className="mt-10">
      <style>{COMMENT_ANIM}</style>

      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[22px]" style={{ color: theme.primary }}>
          forum
        </span>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {localComments.length === 0
            ? 'No comments yet'
            : `${localComments.length} ${localComments.length === 1 ? 'Comment' : 'Comments'}`}
        </h2>
        <div className="flex-1 h-px rounded-full" style={{ backgroundColor: hexToRgba(theme.primary, 0.12) }} />
      </div>

      {/* ── New comment input ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 mb-8"
        style={{
          backgroundColor: hexToRgba(theme.primary, 0.04),
          border: `2px solid ${hexToRgba(theme.primary, 0.12)}`,
        }}
      >
        <div className="flex gap-3">
          <img
            src={authUserAvatar}
            alt="you"
            className="size-9 rounded-full object-cover flex-shrink-0 mt-1"
          />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment()
              }}
              placeholder="Share your thoughts… (⌘ Enter to post)"
              rows={3}
              className="w-full text-sm px-4 py-3 rounded-xl outline-none resize-none transition-all"
              style={{
                backgroundColor: 'white',
                border: `2px solid ${hexToRgba(theme.primary, 0.15)}`,
                color: '#334155',
                lineHeight: '1.75',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = hexToRgba(theme.primary, 0.45)
                e.target.style.boxShadow   = `0 0 0 4px ${hexToRgba(theme.primary, 0.08)}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = hexToRgba(theme.primary, 0.15)
                e.target.style.boxShadow   = 'none'
              }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                {newComment.length > 0 ? `${newComment.length} characters` : 'Be kind and thoughtful ✨'}
              </span>

              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isPostingComment}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: newComment.trim()
                    ? `0 4px 14px ${hexToRgba(theme.primary, 0.35)}, 0 2px 0 ${hexToRgba(theme.primary, 0.45)}`
                    : 'none',
                }}
              >
                {isPostingComment
                  ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-[16px]">send</span>
                }
                {isPostingComment ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comment list ────────────────────────────────────────────────── */}
      {isFetchingComments ? (
        <CommentSkeleton theme={theme} count={3} />
      ) : localComments.length === 0 ? (
        <div className="text-center py-16">
          <span
            className="material-symbols-outlined text-5xl mb-3 block"
            style={{ color: hexToRgba(theme.primary, 0.22) }}
          >
            chat_bubble_outline
          </span>
          <p className="text-slate-400 font-bold text-base">Start the conversation!</p>
          <p className="text-slate-300 text-sm mt-1">Be the first to leave a comment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {localComments.map((comment, i) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              theme={theme}
              isAuthor={isAuthor}
              currentUserId={currentUserId}
              authUserAvatar={authUserAvatar}
              onDeleteComment={handleDeleteComment}
              onPostReply={handlePostReply}
              delayIndex={i}
            />
          ))}
        </div>
      )}
    </section>
  )
}