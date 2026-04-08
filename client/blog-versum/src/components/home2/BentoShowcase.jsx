import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { useNavigate } from 'react-router-dom'

export default function BentoShowcase() {
  const theme = useThemeStore((state) => state.getTheme())
  const navigate = useNavigate()

  return (
    <section className="mb-16">
      <h2 className="text-3xl md:text-4xl font-extrabold bouncy-text text-slate-900 dark:text-white mb-8 text-center md:text-left">
        What's in the{' '}
        <span className="italic" style={{ color: theme.primary }}>
          Inkwell?
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Large feature: Collaborative storytelling */}
        <div
          className="md:col-span-2 text-white p-10 rounded-xl border-4 flex flex-col justify-end min-h-[280px] relative overflow-hidden group cursor-pointer"
          style={{
            backgroundColor: theme.primary,
            borderColor: hexToRgba(theme.primary, 0.8),
            boxShadow: `4px 4px 0 ${hexToRgba(theme.primary, 0.4)}`,
          }}
          onClick={() => navigate('/signup')}
        >
          <span className="material-symbols-outlined absolute -top-4 -right-4 text-[9rem] opacity-10 group-hover:scale-110 transition-transform duration-300 select-none pointer-events-none">
            menu_book
          </span>
          <h3 className="text-2xl font-extrabold mb-2">Collaborative Storytelling</h3>
          <p className="text-white/80 font-medium">
            Jump into a canvas with friends and build universes one sentence at a time.
          </p>
        </div>

        {/* Custom Doodles */}
        <div
          className="bg-accent-teal/10 dark:bg-slate-900 p-8 rounded-xl border-4 hover:shadow-xl hover:scale-[1.02] transition-all cartoon-border cursor-pointer"
          style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
          onClick={() => navigate('/signup')}
        >
          <span
            className="material-symbols-outlined text-4xl mb-4 block"
            style={{ color: theme.primary }}
          >
            brush
          </span>
          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 bouncy-text">
            Custom Doodles
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Personalize every post with hand-drawn motifs.
          </p>
        </div>

        {/* Ink History */}
        <div
          className="bg-purple-50 dark:bg-slate-900 p-8 rounded-xl border-4 hover:shadow-xl hover:scale-[1.02] transition-all cartoon-border cursor-pointer"
          style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
          onClick={() => navigate('/signup')}
        >
          <span
            className="material-symbols-outlined text-4xl mb-4 block"
            style={{ color: theme.primary }}
          >
            history_edu
          </span>
          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 bouncy-text">
            Ink History
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Rewind time and see how your story evolved.
          </p>
        </div>

        {/* Sketchpad mode */}
        <div
          className="md:col-span-2 bg-white dark:bg-slate-900 p-7 rounded-xl border-4 flex items-center gap-6 hover:shadow-xl transition-all cartoon-border cursor-pointer"
          style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
          onClick={() => navigate('/signup')}
        >
          <div
            className="w-20 h-20 flex-shrink-0 rounded-xl flex items-center justify-center border-4"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.08),
              borderColor: hexToRgba(theme.primary, 0.2),
            }}
          >
            <span
              className="material-symbols-outlined text-4xl"
              style={{ color: theme.primary }}
            >
              draw
            </span>
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1 bouncy-text">
              Sketchpad Mode
            </h4>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
              Don't just write — draw your diagrams and feelings directly on the page.
            </p>
          </div>
        </div>

        {/* Daily Prompt */}
        <div
          className="md:col-span-2 bg-white dark:bg-slate-900 p-7 rounded-xl border-4 border-dashed hover:shadow-xl transition-all"
          style={{ borderColor: hexToRgba(theme.primary, 0.3) }}
        >
          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 bouncy-text flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: theme.primary }}>
              lightbulb
            </span>
            Featured Daily Prompt
          </h4>
          <div
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.05),
              borderColor: hexToRgba(theme.primary, 0.15),
            }}
          >
            <p className="italic text-slate-700 dark:text-slate-300 font-medium">
              &ldquo;If you were a raindrop, where would you want to land first?&rdquo;
            </p>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="mt-4 text-sm font-extrabold px-5 py-2 rounded-full transition-all hover:scale-105"
            style={{
              color: theme.primary,
              backgroundColor: hexToRgba(theme.primary, 0.08),
            }}
          >
            Write Now →
          </button>
        </div>
      </div>
    </section>
  )
}
