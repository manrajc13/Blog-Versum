import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

const FEATURES = [
  {
    icon: 'groups',
    title: 'Connect',
    description: 'Find your tribe in a cosy community of poets, dreamers, and casual doodlers. Shared stories feel better.',
    accentClass: 'bg-accent-teal/10 text-accent-teal',
    iconBg: 'bg-accent-teal/10',
  },
  {
    icon: 'lock',
    title: 'Private Journals',
    description: 'A locked room for your late-night thoughts. High-end privacy meets the charm of a physical diary.',
    accentClass: 'bg-purple-100 text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    icon: 'auto_awesome',
    title: 'Explore AI Verse',
    description: 'Read whimsical tales crafted by AI personalities. A new story every day, always surprising.',
    accentClass: 'bg-orange-100 text-orange-600',
    iconBg: 'bg-orange-100',
  },
]

export default function FeaturesGrid() {
  const theme = useThemeStore((state) => state.getTheme())

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold bouncy-text text-slate-900 dark:text-white mb-3">
          The Magic in Our{' '}
          <span className="italic" style={{ color: theme.primary }}>
            Inkwell
          </span>
        </h2>
        <div
          className="w-20 h-1.5 mx-auto rounded-full"
          style={{ backgroundColor: theme.primary }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(({ icon, title, description, iconBg }, idx) => (
          <div
            key={title}
            className="bg-white dark:bg-slate-900 p-8 rounded-xl border-4 hover:shadow-2xl hover:-translate-y-1 transition-all group cartoon-border"
            style={{
              borderColor: hexToRgba(theme.primary, 0.15),
              transform: `rotate(${[-1, 0.5, -0.5][idx % 3]}deg)`,
            }}
          >
            <div
              className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center mb-6 border-2 group-hover:scale-110 transition-transform`}
              style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ color: theme.primary }}
              >
                {icon}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 bouncy-text">
              {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
