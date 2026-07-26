import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { setPostAuthRedirect } from '../../lib/authRedirect'

/**
 * LoginPromptModal — gate shown when a logged-out visitor tries to open an
 * auth-only destination (a creator profile, a story). Offers Login or Sign Up;
 * either choice stashes the intended path and routes to the auth page, so the
 * visitor lands back on that destination once they authenticate.
 *
 * Props:
 *   open       — whether the modal is visible
 *   onClose    — close handler
 *   redirectTo — app path to return to after authentication
 *   title / description — optional copy overrides
 */
export default function LoginPromptModal({
  open,
  onClose,
  redirectTo,
  title = 'Join BlogVerse to continue',
  description = 'Log in or create a free account to open this and dive into the whole Verse.',
}) {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const go = (path) => {
    setPostAuthRedirect(redirectTo)
    navigate(path)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-4 p-8 shadow-2xl"
        style={{ borderColor: hexToRgba(theme.primary, 0.25) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div
          className="w-16 h-16 rounded-2xl rotate-[-6deg] flex items-center justify-center mb-5"
          style={{ backgroundColor: hexToRgba(theme.primary, 0.12) }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: theme.primary }}>
            lock_open
          </span>
        </div>

        <h3 className="text-2xl font-extrabold bouncy-text text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-7">{description}</p>

        <div className="space-y-3">
          <button
            onClick={() => go('/login')}
            className="w-full h-12 rounded-xl text-white font-extrabold transition-all hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.6)}`,
            }}
          >
            Log In
          </button>
          <button
            onClick={() => go('/signup')}
            className="w-full h-12 rounded-xl font-extrabold border-2 transition-all hover:scale-[1.02] active:scale-95"
            style={{
              color: theme.primary,
              borderColor: hexToRgba(theme.primary, 0.35),
              backgroundColor: hexToRgba(theme.primary, 0.06),
            }}
          >
            Sign Up — it's free
          </button>
        </div>
      </div>
    </div>
  )
}
