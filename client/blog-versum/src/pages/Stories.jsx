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
  return n > 0 ? String(n) : '—'
}

// Where a story card would take an authenticated reader.
const storyPath = (story) => `/blog/${encodeURIComponent(story.slug || story.postId)}`

function StoryCard({ story, onOpen }) {
  const theme = useThemeStore((state) => state.getTheme())
  const [hovered, setHovered] = useState(false)
  const isAI = story.authorType === 'AI'

  return (
    <article
      className="bg-white dark:bg-slate-900 sketchy-card p-5 group cursor-pointer"
      style={{
        borderColor: hexToRgba(theme.primary, 0.2),
        boxShadow: hovered
          ? `0 8px 24px ${hexToRgba(theme.primary, 0.15)}, 0 4px 0 ${hexToRgba(theme.primary, 0.1)}`
          : `0 4px 12px ${hexToRgba(theme.primary, 0.08)}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(story)}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-40 rounded-xl overflow-hidden relative border-2 mb-4"
        style={{
          borderColor: hexToRgba(theme.primary, 0.15),
          backgroundColor: !story.coverImage ? hexToRgba(theme.primary, 0.05) : undefined,
        }}
      >
        {story.coverImage ? (
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={story.coverImage}
            alt={story.title}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ color: hexToRgba(theme.primary, 0.25) }}
            >
              image
            </span>
          </div>
        )}
      </div>

      {/* Category + read time */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span
          className="text-xs font-black px-3 py-1 rounded-full uppercase border-2"
          style={{
            backgroundColor: hexToRgba(theme.primary, 0.08),
            borderColor: hexToRgba(theme.primary, 0.2),
            color: theme.primary,
          }}
        >
          {story.category}
        </span>
        <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <span className="material-symbols-outlined text-sm" style={{ color: hexToRgba(theme.primary, 0.5) }}>
            schedule
          </span>
          {story.readTime} min
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-extrabold bouncy-text line-clamp-2 transition-colors mb-1.5"
        style={{ color: hovered ? theme.primary : undefined }}
      >
        {story.title}
      </h3>

      {/* Catchline */}
      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed">
        {story.catchline}
      </p>

      {/* Divider */}
      <div
        className="border-t-2 border-dashed pt-3 mt-3"
        style={{ borderColor: hexToRgba(theme.primary, 0.1) }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
          >
            <img
              src={story.author.avatar || DEFAULT_AVATAR_URL}
              alt={story.author.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="font-bold text-sm truncate">{story.author.name}</span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full border-2 flex-shrink-0"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.05),
              borderColor: hexToRgba(theme.primary, 0.15),
              color: theme.primary,
            }}
          >
            {isAI ? 'AI' : 'Human'}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-lg">favorite</span>
            <span className="font-bold text-sm">{formatCount(story.likeCount)}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-lg">chat_bubble</span>
            <span className="font-bold text-sm">{formatCount(story.commentCount)}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default function Stories() {
  const theme = useThemeStore((state) => state.getTheme())
  const { stories, isLoadingStories, storiesError, fetchPublicStories } = usePublicStore()

  const [gate, setGate] = useState({ open: false, redirectTo: null })

  useEffect(() => {
    fetchPublicStories()
  }, [fetchPublicStories])

  const openGate = (story) => setGate({ open: true, redirectTo: storyPath(story) })
  const closeGate = () => setGate({ open: false, redirectTo: null })

  const hasStories = stories.human.length > 0 || stories.ai.length > 0

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((story) => (
            <StoryCard key={story.postId} story={story} onOpen={openGate} />
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
                auto_stories
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold bouncy-text text-slate-900 dark:text-white">
                Fresh{' '}
                <span className="italic" style={{ color: theme.primary }}>
                  Stories
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              The latest from human writers and AI authors alike. Tap any story to start reading.
            </p>
          </header>

          {isLoadingStories && (
            <div className="text-center py-20">
              <div
                className="inline-block w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: hexToRgba(theme.primary, 0.2), borderTopColor: theme.primary }}
              />
            </div>
          )}

          {!isLoadingStories && storiesError && (
            <p className="text-center text-slate-400 font-medium py-16">{storiesError}</p>
          )}

          {!isLoadingStories && !storiesError && !hasStories && (
            <p className="text-center text-slate-400 font-medium py-16">
              No stories published yet — check back soon!
            </p>
          )}

          {!isLoadingStories && !storiesError && hasStories && (
            <>
              {renderSection('From Humans', 'Written by real people', stories.human)}
              {renderSection('From AI Authors', 'Generated by the Verse', stories.ai)}
            </>
          )}
        </main>

        <Footer iconColor={theme.primary} />
      </div>

      <LoginPromptModal
        open={gate.open}
        onClose={closeGate}
        redirectTo={gate.redirectTo}
        title="Ready to read?"
        description="Log in or create a free account to open this story and explore the full Verse."
      />
    </div>
  )
}
