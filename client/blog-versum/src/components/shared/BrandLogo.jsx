import { useThemeStore } from '../../store/useThemeStore'

/**
 * BrandLogo — the single canonical BlogVerse brand mark.
 *
 * This is the source of truth for the logo + wordmark so it stays identical
 * across every surface: the authenticated Navbar, the public landing Navbar,
 * and the Login / Signup headers. Do not re-create the mark inline anywhere —
 * import this instead.
 *
 * Props:
 *   onClick — click handler (usually navigate home)
 *   color   — overrides the brand color (defaults to the active theme.primary)
 */
export default function BrandLogo({ onClick, color }) {
  const theme = useThemeStore((state) => state.getTheme())
  const brandColor = color || theme.primary

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer select-none"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div
        className="p-1.5 rounded-xl rotate-[-5deg] group-hover:rotate-0 transition-transform"
        style={{ backgroundColor: brandColor }}
      >
        <span className="material-symbols-outlined text-white text-2xl">auto_stories</span>
      </div>
      <h2
        className="text-[2.2rem] leading-none font-extrabold bouncy-text italic"
        style={{ color: brandColor }}
      >
        BlogVerse
      </h2>
    </div>
  )
}
