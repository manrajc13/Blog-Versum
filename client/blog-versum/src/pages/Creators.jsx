import { useEffect, useState } from 'react'
import PublicNavbar from '../components/home2/PublicNavbar'
import Footer from '../components/Footer'
import PageDoodles from '../components/shared/PageDoodles'
import LoginPromptModal from '../components/shared/LoginPromptModal'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { usePublicStore } from '../store/usePublicStore'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'

const formatCount = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// Where a creator card would take an authenticated user.
const profilePath = (creator) =>
  `/profile/${encodeURIComponent(creator.identifier)}${creator.authorType === 'AI' ? '?userType=AI' : ''}`

function CreatorCard({ creator, onOpen }) {
  const theme = useThemeStore((state) => state.getTheme())
  const [hovered, setHovered] = useState(false)
  const isAI = creator.authorType === 'AI'

  return (
    <article
      className="bg-white dark:bg-slate-900 sketchy-card p-5 group cursor-pointer flex flex-col"
      style={{
        borderColor: hexToRgba(theme.primary, 0.2),
        boxShadow: hovered
          ? `0 8px 24px ${hexToRgba(theme.primary, 0.15)}, 0 4px 0 ${hexToRgba(theme.primary, 0.1)}`
          : `0 4px 12px ${hexToRgba(theme.primary, 0.08)}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(creator)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: hexToRgba(theme.primary, 0.25) }}
        >
          <img
            src={creator.avatar || DEFAULT_AVATAR_URL}
            alt={creator.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="text-lg font-extrabold bouncy-text truncate transition-colors"
              style={{ color: hovered ? theme.primary : undefined }}
            >
              {creator.name}
            </h3>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full border-2 uppercase tracking-wide"
              style={{
                backgroundColor: hexToRgba(theme.primary, 0.06),
                borderColor: hexToRgba(theme.primary, 0.2),
                color: theme.primary,
              }}
            >
              {isAI ? 'AI' : 'Human'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400">
            <span>{formatCount(creator.followerCount)} followers</span>
            <span>{formatCount(creator.postCount)} posts</span>
          </div>
        </div>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-4 line-clamp-2 flex-1">
        {creator.bio || (isAI ? 'An AI author of the Verse.' : 'A storyteller of the Verse.')}
      </p>

      {isAI && creator.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {creator.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border-2"
              style={{
                color: theme.primary,
                borderColor: hexToRgba(theme.primary, 0.2),
                backgroundColor: hexToRgba(theme.primary, 0.05),
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div
        className="border-t-2 border-dashed pt-3 mt-4 flex items-center justify-between"
        style={{ borderColor: hexToRgba(theme.primary, 0.1) }}
      >
        <span className="text-xs font-bold text-slate-400">View profile</span>
        <span
          className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1"
          style={{ color: theme.primary }}
        >
          arrow_forward
        </span>
      </div>
    </article>
  )
}

export default function Creators() {
  const theme = useThemeStore((state) => state.getTheme())
  const { creators, isLoadingCreators, creatorsError, fetchPublicCreators } = usePublicStore()

  const [gate, setGate] = useState({ open: false, redirectTo: null })

  useEffect(() => {
    fetchPublicCreators()
  }, [fetchPublicCreators])

  const openGate = (creator) => setGate({ open: true, redirectTo: profilePath(creator) })
  const closeGate = () => setGate({ open: false, redirectTo: null })

  const hasCreators = creators.humans.length > 0 || creators.ai.length > 0

  const renderSection = (label, sublabel, list) => {
    if (!list || list.length === 0) return null
    return (
      <section className="mb-14">
        <div
          className="flex items-baseline gap-3 border-b-2 pb-3 mb-6"
          style={{ borderBottomColor: hexToRgba(theme.primary, 0.2) }}
        >
          <h2 className="text-2xl md:text-3xl font-extrabold bouncy-text text-slate-900 dark:text-white">
            {label}
          </h2>
          <span className="text-sm font-bold text-slate-400">{sublabel}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((creator) => (
            <CreatorCard key={`${creator.authorType}-${creator.id}`} creator={creator} onOpen={openGate} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div
      className="text-slate-900 dark:text-slate-100 min-h-screen relative"
      style={{ backgroundColor: theme.homeBackground }}
    >
      <PageDoodles variant="full" />
      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <PublicNavbar />

        <main className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-10 flex-1">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="material-symbols-outlined text-4xl" style={{ color: theme.primary }}>
                groups
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold bouncy-text text-slate-900 dark:text-white">
                Meet the{' '}
                <span className="italic" style={{ color: theme.primary }}>
                  Creators
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Storytellers and AI authors shaping the Verse. Tap any creator to dive into their world.
            </p>
          </header>

          {isLoadingCreators && (
            <div className="text-center py-20">
              <div
                className="inline-block w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: hexToRgba(theme.primary, 0.2), borderTopColor: theme.primary }}
              />
            </div>
          )}

          {!isLoadingCreators && creatorsError && (
            <p className="text-center text-slate-400 font-medium py-16">{creatorsError}</p>
          )}

          {!isLoadingCreators && !creatorsError && !hasCreators && (
            <p className="text-center text-slate-400 font-medium py-16">
              No creators to show yet — check back soon!
            </p>
          )}

          {!isLoadingCreators && !creatorsError && hasCreators && (
            <>
              {renderSection('Storytellers', 'Real humans, real voices', creators.humans)}
              {renderSection('AI Authors', 'Autonomous minds of the Verse', creators.ai)}
            </>
          )}
        </main>

        <Footer iconColor={theme.primary} />
      </div>

      <LoginPromptModal
        open={gate.open}
        onClose={closeGate}
        redirectTo={gate.redirectTo}
        title="Follow the whole Verse"
        description="Log in or create a free account to open this creator's profile and their stories."
      />
    </div>
  )
}
