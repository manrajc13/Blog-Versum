import toast from 'react-hot-toast'
import { Loader } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useThemeStore } from '../../../store/useThemeStore'
import { hexToRgba, themeConfig } from '../../../store/themeConfig'

const THEMES = [
  {
    id: 'plain',
    name: 'Plain',
    description: 'Minimal & Neutral',
    cardBg: 'bg-white dark:bg-slate-900',
    wrapperBg: 'bg-white dark:bg-slate-900',
    border: 'border-slate-300 dark:border-slate-700',
    barColor: 'bg-slate-200 dark:bg-slate-700',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-white',
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    description: 'Bright & Happy',
    wrapperBg: 'bg-amber-50 dark:bg-amber-900/20',
    previewBg: 'bg-gradient-to-br from-yellow-100 to-amber-200',
    border: 'border-transparent hover:border-amber-400',
    barColor: 'bg-amber-100',
    dotColor: 'bg-amber-400',
    icon: 'wb_sunny',
    iconColor: 'text-amber-500/20',
    nameColor: 'text-amber-800 dark:text-amber-200',
    descColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Cozy & Dark',
    wrapperBg: 'bg-slate-100 dark:bg-slate-800',
    previewBg: 'bg-indigo-900',
    cardBg: 'bg-slate-800 border border-slate-700',
    border: 'border-transparent hover:border-indigo-400',
    barColor: 'bg-indigo-500/30',
    dotColor: 'bg-indigo-400',
    icon: 'bedtime',
    iconColor: 'text-indigo-400/20',
    nameColor: 'text-slate-800 dark:text-slate-100',
    descColor: 'text-slate-500',
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Calm & Bubbly',
    wrapperBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    previewBg: 'bg-gradient-to-br from-cyan-100 to-teal-200',
    border: 'border-transparent hover:border-cyan-400',
    barColor: 'bg-cyan-100',
    dotColor: 'bg-cyan-400',
    icon: 'bubble_chart',
    iconColor: 'text-cyan-500/20',
    nameColor: 'text-cyan-800 dark:text-cyan-200',
    descColor: 'text-cyan-600',
  },
  {
    id: 'cotton',
    name: 'Cotton Candy',
    description: 'Sweet & Soft',
    wrapperBg: 'bg-pink-50 dark:bg-pink-900/20',
    previewBg: 'bg-gradient-to-br from-pink-100 to-rose-200',
    border: 'border-transparent hover:border-pink-400',
    barColor: 'bg-pink-100',
    dotColor: 'bg-pink-400',
    icon: 'cloud',
    iconColor: 'text-pink-500/20',
    nameColor: 'text-pink-800 dark:text-pink-200',
    descColor: 'text-pink-600',
  },
  {
    id: 'forest',
    name: 'Forest Adventure',
    description: 'Fresh & Leafy',
    wrapperBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    previewBg: 'bg-gradient-to-br from-emerald-100 to-green-200',
    border: 'border-transparent hover:border-emerald-400',
    barColor: 'bg-emerald-100',
    dotColor: 'bg-emerald-400',
    icon: 'eco',
    iconColor: 'text-emerald-500/20',
    nameColor: 'text-emerald-800 dark:text-emerald-200',
    descColor: 'text-emerald-600',
  },
]

export default function ThemeSection({ theme }) {
  const themeId = useThemeStore((state) => state.themeId)
  const setTheme = useThemeStore((state) => state.setTheme)
  const updateTheme = useAuthStore((state) => state.updateTheme)
  const isUpdatingTheme = useAuthStore((state) => state.isUpdatingTheme)
  const [pendingThemeName, setPendingThemeName] = useState('')

  const handleThemeChange = async (selectedTheme) => {
    if (isUpdatingTheme || selectedTheme.id === themeId) {
      return
    }

    const previousThemeId = themeId
    setPendingThemeName(selectedTheme.name)

    const didUpdate = await updateTheme(selectedTheme.id)

    if (didUpdate) {
      setTheme(selectedTheme.id)
      toast.success(`Theme changed to ${selectedTheme.name}`, {
        style: {
          background: themeConfig[selectedTheme.id].primary,
          color: '#ffffff',
          borderRadius: '12px',
          fontWeight: 700,
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: themeConfig[selectedTheme.id].primary,
        },
      })
    } else {
      toast.error('unable to update the theme try again later', {
        style: {
          background: themeConfig[previousThemeId].primary,
          color: '#ffffff',
          borderRadius: '12px',
          fontWeight: 700,
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: themeConfig[previousThemeId].primary,
        },
      })
    }

    setPendingThemeName('')
  }

  return (
    <div className="space-y-6 relative">
      <div className="mb-6">
        <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#6c1d45' }}>Theme Universe</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Pick a vibe that matches your blog&apos;s personality!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {THEMES.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleThemeChange(theme)}
            className={`relative group cursor-pointer p-4 rounded-xl border-4 transition-all ${theme.wrapperBg} ${theme.border} ${isUpdatingTheme ? 'pointer-events-none opacity-70' : ''}`}
            style={
              themeId === theme.id
                ? {
                  borderColor: themeConfig[theme.id].primary,
                  boxShadow: `0 12px 24px ${hexToRgba(themeConfig[theme.id].primary, 0.25)}`,
                }
                : {}
            }
          >
            {themeId === theme.id && (
              <div
                className="absolute -top-4 -right-4 px-4 py-1 rounded-full font-black text-xs shadow-lg flex items-center gap-1 rotate-12 group-hover:rotate-0 transition-transform border-2 border-white text-white"
                style={{ backgroundColor: themeConfig[theme.id].primary }}
              >
                <span className="material-symbols-outlined text-sm">star</span> ACTIVE
              </div>
            )}

            <div className={`h-40 rounded-lg mb-4 overflow-hidden flex items-center justify-center relative ${theme.previewBg || 'bg-white dark:bg-slate-800'}`}>
              {theme.icon && (
                <span className={`material-symbols-outlined text-7xl absolute -bottom-4 -left-4 ${theme.iconColor}`}>
                  {theme.icon}
                </span>
              )}
              <div className={`w-32 h-20 rounded shadow-sm p-2 flex flex-col gap-2 scale-90 ${theme.cardBg || 'bg-white'}`}>
                <div className={`w-full h-2 rounded ${theme.barColor}`}></div>
                <div className={`w-2/3 h-2 rounded ${theme.barColor}`}></div>
                <div className="mt-auto flex justify-between">
                  <div className={`size-4 rounded-full ${theme.dotColor}`}></div>
                  <div className={`w-10 h-3 rounded ${theme.barColor}`}></div>
                </div>
              </div>
            </div>

            <h3 className={`font-black ${theme.nameColor || 'text-slate-800 dark:text-slate-100'}`}>{theme.name}</h3>
            <p className={`text-xs font-bold ${theme.descColor || 'text-slate-500'}`}>{theme.description}</p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border-2 px-6 py-4 text-lg font-bold"
        style={{
          borderColor: hexToRgba(theme.primary, 0.26),
          backgroundColor: hexToRgba(theme.primary, 0.08),
          color: '#7a2451',
        }}
      >
        <span className="mr-2">🎨</span>
        Active theme: <span style={{ color: theme.primary }}>{themeConfig[themeId].label}</span> - saved automatically to your browser!
      </div>

      {isUpdatingTheme && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.28)' }}
        >
          <div className="rounded-2xl px-8 py-6 bg-white shadow-xl border-2 border-slate-200 flex items-center gap-4">
            <Loader className="size-8 animate-spin" style={{ color: theme.primary }} />
            <p className="text-lg font-bold text-slate-800">
              Updating theme to {pendingThemeName || themeConfig[themeId].label}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
