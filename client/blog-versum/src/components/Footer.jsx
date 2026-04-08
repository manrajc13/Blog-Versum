import { hexToRgba } from '../store/themeConfig'

export default function Footer({ iconColor = '#8c2bee' }) {
  return (
    <footer
      className="mt-20 border-t-4 border-dashed py-12 px-6 overflow-hidden relative"
      style={{
        backgroundColor: hexToRgba(iconColor, 0.08),
        borderTopColor: hexToRgba(iconColor, 0.2),
      }}
    >
      {/* Decorative background doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-wrap gap-20 p-10">
        <span className="material-symbols-outlined text-4xl rotate-12" style={{ color: iconColor }}>star</span>
        <span className="material-symbols-outlined text-5xl text-accent-teal -rotate-12">coffee</span>
        <span className="material-symbols-outlined text-4xl text-accent-orange rotate-45">edit</span>
        <span className="material-symbols-outlined text-6xl -rotate-12" style={{ color: iconColor }}>auto_stories</span>
        <span className="material-symbols-outlined text-4xl text-accent-teal rotate-12">celebration</span>
        <span className="material-symbols-outlined text-5xl text-accent-orange -rotate-45">ink_pen</span>
      </div>

      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg rotate-[-5deg]" style={{ backgroundColor: iconColor }}>
              <span className="material-symbols-outlined text-white text-xl">auto_stories</span>
            </div>
            <h2 className="text-xl font-extrabold bouncy-text italic" style={{ color: iconColor }}>BlogVerse</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Where stories come to life in a world of doodles and dreams.
          </p>
        </div>

        {/* World */}
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white mb-4">World</h5>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Our Mission</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Creator Studio</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white mb-4">Support</h5>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Safety Rules</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Community Guidelines</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h5 className="font-bold text-slate-900 dark:text-white mb-4">Keep Dreaming</h5>
          <div className="flex gap-4">
            <a
              className="size-10 rounded-xl flex items-center justify-center hover:text-white transition-all"
              style={{ backgroundColor: hexToRgba(iconColor, 0.12), color: iconColor }}
              href="#"
            >
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
            <a
              className="size-10 rounded-xl flex items-center justify-center hover:text-white transition-all"
              style={{ backgroundColor: hexToRgba(iconColor, 0.12), color: iconColor }}
              href="#"
            >
              <span className="material-symbols-outlined">share</span>
            </a>
            <a
              className="size-10 rounded-xl flex items-center justify-center hover:text-white transition-all"
              style={{ backgroundColor: hexToRgba(iconColor, 0.12), color: iconColor }}
              href="#"
            >
              <span className="material-symbols-outlined">link</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-400">© 2026 BlogVerse. Made with ❤️ and lots of ink.</p>
      </div>
    </footer>
  )
}
