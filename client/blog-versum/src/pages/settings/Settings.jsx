import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import ProfileSection from './sections/ProfileSection'
import ThemeSection from './sections/ThemeSection'
import NotificationsSection from './sections/NotificationsSection'
import PageDoodles from '../../components/shared/PageDoodles'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'
import { useAuthStore } from '../../store/useAuthStore'

const SETTINGS_NAV = [
  { label: 'Profile', icon: 'person' },
  { label: 'Theme', icon: 'palette' },
  { label: 'Notifications', icon: 'notifications_active' },
  { label: 'Privacy', icon: 'security' },
]

function PlaceholderSection({ title, theme }) {
  return (
    <div
      className="rounded-2xl border-2 border-dashed bg-white/70 p-8"
      style={{ borderColor: hexToRgba(theme.primary, 0.35) }}
    >
      <h2 className="text-3xl font-black tracking-tight mb-2">{title}</h2>
      <p className="text-slate-500 font-medium">This section will be populated in the next iteration.</p>
    </div>
  )
}

export default function Settings({authUser}) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('Profile')
  const theme = useThemeStore((state) => state.getTheme())

  useEffect(() => {
    const requestedTab = searchParams.get('tab')
    const allowedTabs = ['Profile', 'Theme', 'Notifications', 'Privacy']

    if (requestedTab && allowedTabs.includes(requestedTab)) {
      setActiveSection(requestedTab)
      return
    }

    setActiveSection('Profile')
  }, [searchParams])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="font-display text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.settingsBackground }}>
      <PageDoodles variant="sparse" />

      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          activeLink={null}
          navLinks={[
            { label: 'Home', to: '/home' },
            // { label: 'Explore', to: '#' },
            // { label: 'My Blogs', to: '#' },
            // { label: 'Community', to: '#' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="w-full grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 px-4 pb-8 pt-4 lg:pl-4 lg:pr-10 lg:pb-10 lg:pt-4">
          <aside className="w-full lg:w-[300px] lg:sticky lg:top-24 self-start space-y-4">
            <div className="flex items-center gap-3 pl-1">
              <span className="material-symbols-outlined text-3xl" style={{ color: hexToRgba(theme.primary, 0.35) }}>settings</span>
            </div>

            <div
              className="p-4 mb-4 rounded-xl border-2"
              style={{
                backgroundColor: theme.settingsPanelBackground,
                borderColor: hexToRgba(theme.primary, 0.3),
              }}
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 px-2" style={{ color: theme.primary }}>Settings Menu</p>
              <nav className="space-y-1">
                {SETTINGS_NAV.map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveSection(label)
                      setSearchParams({ tab: label })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
                    style={
                      activeSection === label
                        ? {
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                          boxShadow: `0 10px 20px ${hexToRgba(theme.primary, 0.35)}`,
                        }
                        : { color: '#7a2451' }
                    }
                  >
                    <span
                      className="material-symbols-outlined transition-transform"
                      style={{
                        color: activeSection === label ? '#ffffff' : theme.primary,
                      }}
                    >
                      {icon}
                    </span>
                    {label}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-all font-bold"
                  style={{ color: '#7a2451' }}
                >
                  <span className="material-symbols-outlined transition-transform" style={{ color: theme.primary }}>logout</span>
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          <section className="min-w-0 space-y-8 lg:pt-1">
            {activeSection === 'Profile' && <ProfileSection theme={theme} />}
            {activeSection === 'Theme' && <ThemeSection theme={theme} />}
            {activeSection === 'Notifications' && <NotificationsSection theme={theme} authUser={authUser} />}
            {activeSection === 'Privacy' && <PlaceholderSection title="Privacy Settings" theme={theme} />}
          </section>
        </main>
      </div>
    </div>
  )
}
