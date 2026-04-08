import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

export default function HeroSection() {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())

  return (
    <section
      className="relative rounded-2xl p-8 md:p-14 mb-16 overflow-hidden border-4 shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(theme.primary, 0.07)} 0%, rgba(255,255,255,0.92) 100%)`,
        borderColor: hexToRgba(theme.primary, 0.22),
      }}
    >
      {/* Decorative background icons */}
      <span className="material-symbols-outlined absolute top-6 right-8 text-8xl pointer-events-none select-none opacity-[0.06]">
        edit_note
      </span>
      <span className="material-symbols-outlined absolute bottom-6 left-6 text-7xl pointer-events-none select-none opacity-[0.05] rotate-12">
        auto_stories
      </span>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Text content */}
        <div className="space-y-7 text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black border-2"
            style={{
              color: theme.primary,
              borderColor: hexToRgba(theme.primary, 0.3),
              backgroundColor: hexToRgba(theme.primary, 0.07),
            }}
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            The world's most whimsical writing platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] bouncy-text">
            Your Pencils Are{' '}
            <span className="italic" style={{ color: theme.primary }}>
              Waiting
            </span>{' '}
            to Talk Back!
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Step into a living sketchbook where your words breathe. Whether it's a secret diary or a shared saga — your stories deserve a home made of magic and ink.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="text-white font-extrabold py-4 px-8 rounded-full active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 6px 0 ${hexToRgba(theme.primary, 0.7)}`,
              }}
            >
              <span className="material-symbols-outlined">edit</span>
              Get Your Free Journal
            </button>
            <button
              onClick={() => navigate('/login')}
              className="font-extrabold py-4 px-8 rounded-full border-4 transition-all flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:scale-105"
              style={{ borderColor: hexToRgba(theme.primary, 0.25) }}
            >
              <span className="material-symbols-outlined" style={{ color: theme.primary }}>login</span>
              Log In
            </button>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="relative flex items-center justify-center">
          {/* Rotated background card for depth */}
          <div
            className="absolute inset-0 rounded-xl rotate-3 -z-0"
            style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
          />
          <div
            className="relative z-10 w-full aspect-[4/3] rounded-xl overflow-hidden border-4 shadow-xl"
            style={{ borderColor: hexToRgba(theme.primary, 0.25) }}
          >
            <img
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 grayscale hover:grayscale-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzPJZeTuskhHidG-RMM1szhzzkNhTX3ZmTCo56LyzHIg3_k-ywlCNERltHmsfG4_bceAGX4Gdm_onfwDnGNHHq22uVzjvJzryGEt6zMNJkaGQ-8Bstfic_KaOkt01G4NQo6LvPAmeIcTdtV3a_zOv9czn5Nn3gBN3EakLmDkPorZF_LqzI3ZMqJG_5nMdaPwACK3g9SCEz55ibUlGfqliWPwjC41Hqp3yEAHja06ppP9Uo2Ct8lrPk_DViP0t_Pntg1We1AsZ1N2ol"
              alt="Person writing in a sketchbook with colorful ink"
            />
          </div>
          {/* Speech bubble floating badge */}
          <div
            className="absolute -bottom-4 -right-2 md:-right-6 bg-white dark:bg-slate-800 px-5 py-3 rounded-xl border-4 shadow-lg rotate-3 hidden sm:block"
            style={{ borderColor: hexToRgba(theme.primary, 0.3) }}
          >
            <p className="font-extrabold text-sm" style={{ color: theme.primary }}>
              Start Your Verse Today! ✨
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
