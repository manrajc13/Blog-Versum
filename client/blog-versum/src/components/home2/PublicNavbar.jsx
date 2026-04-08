import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

export default function PublicNavbar() {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())

  return (
    <nav
      className="sticky top-0 z-50 border-b-2 backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderBottomColor: hexToRgba(theme.primary, 0.15),
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <span
            className="material-symbols-outlined text-4xl bouncy-text"
            style={{ color: theme.primary }}
          >
            auto_stories
          </span>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Blog<span className="italic" style={{ color: theme.primary }}>Verse</span>
          </span>
        </button>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {['Explore', 'Creators', 'Stories'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-slate-600 dark:text-slate-300 text-sm font-bold hover:text-primary transition-colors"
              style={{ '--tw-text-opacity': 1 }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Auth CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 font-bold text-sm text-slate-700 dark:text-slate-200 hover:text-primary transition-colors hidden sm:block"
            style={{ color: undefined }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="text-white font-extrabold py-2.5 px-6 rounded-full text-sm active:translate-y-0.5 transition-all"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.65)}`,
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  )
}
