import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

export default function CtaSection() {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())

  return (
    <section className="mb-20">
      <div
        className="relative rounded-2xl p-12 md:p-16 text-center overflow-hidden border-4 shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(theme.primary, 0.08)} 0%, rgba(255,255,255,0.9) 100%)`,
          borderColor: hexToRgba(theme.primary, 0.22),
        }}
      >
        {/* Decorative element */}
        <span className="material-symbols-outlined absolute -bottom-6 -left-6 text-[8rem] pointer-events-none select-none opacity-[0.06] rotate-45">
          stylus
        </span>
        <span className="material-symbols-outlined absolute -top-4 -right-4 text-[6rem] pointer-events-none select-none opacity-[0.05] -rotate-12">
          draw
        </span>

        <h2 className="text-4xl md:text-5xl font-extrabold bouncy-text text-slate-900 dark:text-white mb-5 relative z-10">
          Don't Let Your Stories{' '}
          <span className="italic" style={{ color: theme.primary }}>
            Dry Up!
          </span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-10 max-w-xl mx-auto leading-relaxed relative z-10">
          The ink is fresh and the paper is ready. Join thousands of creators in the Verse and start your journey today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <button
            onClick={() => navigate('/signup')}
            className="text-white font-extrabold py-5 px-10 rounded-full text-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mx-auto sm:mx-0"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 6px 0 ${hexToRgba(theme.primary, 0.7)}`,
            }}
          >
            <span className="material-symbols-outlined">edit</span>
            Sign Up Now
          </button>
          <button
            onClick={() => navigate('/login')}
            className="font-extrabold py-5 px-10 rounded-full text-lg border-4 transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:scale-105 mx-auto sm:mx-0"
            style={{ borderColor: hexToRgba(theme.primary, 0.3) }}
          >
            Tour the Verse
          </button>
        </div>
      </div>
    </section>
  )
}
