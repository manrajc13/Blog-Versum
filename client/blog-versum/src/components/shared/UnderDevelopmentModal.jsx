import { useEffect, useRef } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

/**
 * UnderDevelopmentModal — shown when a visitor (authenticated or not) opens a
 * post that isn't wired to real content yet (e.g. Explore's mock blog cards).
 * The card surface uses the active theme's background so it reads as part of
 * the app rather than a generic dialog; the page behind it is blurred to keep
 * focus on the message.
 */
export default function UnderDevelopmentModal({ open, onClose }) {
  const theme = useThemeStore((state) => state.getTheme())
  const cardRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Some ancestors (e.g. Explore's transitioning topic section) apply a CSS
  // transform, which makes this "fixed" card pin to that ancestor's box
  // instead of the real viewport — so it can open off-screen. Scrolling it
  // into view fixes that regardless of which containing block ends up applying.
  useEffect(() => {
    if (open) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Card — background follows the active theme */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md rounded-2xl border-4 p-8 shadow-2xl text-center"
        style={{ backgroundColor: theme.homeBackground, borderColor: hexToRgba(theme.primary, 0.25) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div
          className="w-16 h-16 mx-auto rounded-2xl rotate-[-6deg] flex items-center justify-center mb-5"
          style={{ backgroundColor: hexToRgba(theme.primary, 0.14) }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: theme.primary }}>
            construction
          </span>
        </div>

        <h3 className="text-2xl font-extrabold bouncy-text text-slate-900 mb-2">
          Coming Soon
        </h3>
        <p className="text-slate-600 font-medium mb-7">
          This section is currently under active development. We&apos;re putting the
          finishing touches on the full reading experience — thank you for your
          patience while we get it ready.
        </p>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl text-white font-extrabold transition-all hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: theme.primary, boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.6)}` }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
