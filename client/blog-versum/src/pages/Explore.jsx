/**
 * Explore.jsx
 *
 * Revamped layout:
 * ┌──────────────────────────────────────────────────────────┐
 * │ Navbar                                                   │
 * ├──────────────────────────────────────────────────────────┤
 * │ Page header  — "Explore the Verse" + tagline             │
 * ├──────────────────────────────────────────────────────────┤
 * │                                                          │
 * │        CENTERED TOPIC DECK (scroll to navigate)          │
 * │                                                          │
 * │              [Discover Stories button]                   │
 * │                                                          │
 * ├──────────────────────────────────────────────────────────┤
 * │ Blog Cards (shown after clicking "Discover Stories")     │
 * └──────────────────────────────────────────────────────────┘
 *
 * Background: Hand-drawn doodles spread across the page
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TopicDeck from '../components/explore/Topicdeck'
import MasonryFeed from '../components/explore/MasonryFeed'
import ExploreBackground from '../components/explore/ExploreBackground'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { EXPLORE_TOPICS } from '../lib/Mockexploredata'

export default function Explore({ authUser }) {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())

  const [activeTopicId, setActiveTopicId] = useState(EXPLORE_TOPICS[0].id)
  const [showStories, setShowStories] = useState(false)
  const [isLoadingStories, setIsLoadingStories] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const activeTopic = EXPLORE_TOPICS.find((t) => t.id === activeTopicId) || EXPLORE_TOPICS[0]

  const handleTopicChange = (id) => {
    if (id === activeTopicId) return
    setIsTransitioning(true)
    setShowStories(false)
    setTimeout(() => {
      setActiveTopicId(id)
      setIsTransitioning(false)
    }, 200)
  }

  // Quick Jump handler - changes topic and scrolls to deck
  const handleQuickJump = (id) => {
    if (id === activeTopicId) {
      // Even if same topic, scroll to deck
      document.getElementById('topic-deck')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setIsTransitioning(true)
    setShowStories(false)
    setTimeout(() => {
      setActiveTopicId(id)
      setIsTransitioning(false)
      // Scroll to the deck after topic change
      setTimeout(() => {
        document.getElementById('topic-deck')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }, 200)
  }

  const handleDiscoverStories = (topic) => {
    setIsLoadingStories(true)
    // Simulate fetching
    setTimeout(() => {
      setShowStories(true)
      setIsLoadingStories(false)
      // Scroll to stories section
      setTimeout(() => {
        document.getElementById('explore-stories')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 600)
  }

  return (
    <div
      className="text-slate-900 dark:text-slate-100 min-h-screen relative"
      style={{ backgroundColor: theme.homeBackground }}
    >
      {/* Doodle background */}
      <ExploreBackground />

      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          activeLink="Explore"
          onNotificationClick={() => navigate('/settings?tab=Notifications')}
          navLinks={[
            { label: 'Home', to: '/home' },
            { label: 'Explore', to: '/explore' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings', to: '/settings' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="max-w-[1100px] mx-auto w-full px-6 md:px-10 py-10">

          {/* ── Page header ─────────────────────────────────────────── */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: theme.primary }}
              >
                explore
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold bouncy-text text-slate-900 dark:text-white">
                Explore the{' '}
                <span className="italic" style={{ color: theme.primary }}>
                  Verse
                </span>
              </h1>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Flip through topics. Find your next obsession. Every card hides a world.
            </p>
          </header>

          {/* ── Topic Deck (centered, full width) ─────────────────── */}
          <section className="mb-16">
            <TopicDeck
              topics={EXPLORE_TOPICS}
              activeTopic={activeTopic}
              onTopicChange={handleTopicChange}
              onDiscoverStories={handleDiscoverStories}
            />
          </section>

          {/* ── Loading state ─────────────────────────────────────── */}
          {isLoadingStories && (
            <div className="text-center py-16">
              <div
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
                style={{ backgroundColor: hexToRgba(theme.primary, 0.1) }}
              >
                <div
                  className="w-6 h-6 border-3 rounded-full animate-spin"
                  style={{
                    borderColor: hexToRgba(theme.primary, 0.2),
                    borderTopColor: theme.primary,
                  }}
                />
                <span className="font-bold" style={{ color: theme.primary }}>
                  Discovering stories in {activeTopic.label}...
                </span>
              </div>
            </div>
          )}

          {/* ── Stories Section (shown after clicking Discover) ─────── */}
          {showStories && !isLoadingStories && (
            <section
              id="explore-stories"
              className="pt-8"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(16px)' : 'translateY(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              {/* Topic hero banner */}
              <div
                className="rounded-3xl p-8 md:p-10 border-4 overflow-hidden relative mb-10"
                style={{
                  background: `linear-gradient(145deg, ${activeTopic.bgFrom}, ${activeTopic.bgTo})`,
                  borderColor: hexToRgba(activeTopic.bgFrom, 0.3),
                }}
              >
                {/* decorative icon */}
                <span
                  className="material-symbols-outlined absolute -bottom-6 -right-6 pointer-events-none select-none"
                  style={{ color: 'rgba(255,255,255,0.08)', fontSize: '10rem' }}
                >
                  {activeTopic.icon}
                </span>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl" role="img" aria-label={activeTopic.label}>
                      {activeTopic.emoji}
                    </span>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white bouncy-text">
                        Stories in {activeTopic.label}
                      </h2>
                      <p className="text-white/80 font-medium mt-1">
                        {activeTopic.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-black px-4 py-2 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    >
                      {activeTopic.posts.length} stories
                    </span>
                    <button
                      onClick={() => setShowStories(false)}
                      className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                      Hide Stories
                    </button>
                  </div>
                </div>
              </div>

              {/* Section label */}
              <div
                className="flex items-center justify-between border-b-2 pb-4 mb-8"
                style={{ borderBottomColor: hexToRgba(theme.primary, 0.2) }}
              >
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">
                  Top Stories in{' '}
                  <span style={{ color: theme.primary }}>{activeTopic.label}</span>
                </h3>
                <span className="text-sm text-slate-400 font-bold">
                  {activeTopic.posts.length} posts
                </span>
              </div>

              {/* Masonry posts grid */}
              <MasonryFeed
                posts={activeTopic.posts}
                topicColor={activeTopic.bgFrom}
                topicLabel={activeTopic.label}
              />

              {/* Bottom CTA */}
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium text-sm mb-4">
                  Inspired by what you read? Share your own perspective.
                </p>
                <button
                  onClick={() => navigate('/journal/create')}
                  className="text-white font-extrabold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.6)}`,
                  }}
                >
                  <span className="material-symbols-outlined align-middle mr-2 text-base">edit</span>
                  Write Your Own Story
                </button>
              </div>
            </section>
          )}

          {/* ── Empty state when no stories shown ───────────────────── */}
          {!showStories && !isLoadingStories && (
            <div className="text-center py-8">
              <p className="text-slate-400 font-medium text-sm">
                Click{' '}
                <span className="font-bold" style={{ color: theme.primary }}>
                  Discover Stories
                </span>{' '}
                on any topic card to explore its content
              </p>
            </div>
          )}

          {/* ── Quick topic chips ─────────────────────────────────── */}
          <section
            className="rounded-2xl p-6 border-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-12"
            style={{ borderColor: hexToRgba(theme.primary, 0.12) }}
          >
            <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: theme.primary }}
              >
                tag
              </span>
              Quick Jump to Topic
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXPLORE_TOPICS.map((topic) => {
                const isActive = topic.id === activeTopicId
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleQuickJump(topic.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-black border-2 transition-all hover:scale-105 active:scale-95"
                    style={
                      isActive
                        ? {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                            color: '#fff',
                          }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: hexToRgba(theme.primary, 0.25),
                            color: theme.primary,
                          }
                    }
                  >
                    <span className="text-base">{topic.emoji}</span>
                    {topic.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Daily writing nudge ─────────────────────────────────── */}
          <section
            className="rounded-2xl p-6 text-white rotate-1 shadow-xl mt-10 max-w-md mx-auto"
            style={{ backgroundColor: theme.primary }}
          >
            <h4 className="font-extrabold text-lg bouncy-text mb-2">
              Write About{' '}
              <span style={{ opacity: 0.85 }}>{activeTopic.label}</span> ✨
            </h4>
            <p className="text-white/80 text-sm mb-4 font-medium italic">
              &ldquo;{activeTopic.tagline}&rdquo;
            </p>
            <button
              onClick={() => navigate('/journal/create')}
              className="w-full bg-white font-extrabold py-2.5 rounded-xl text-sm transition-all hover:bg-slate-50"
              style={{ color: theme.primary }}
            >
              Start Writing →
            </button>
          </section>

        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}
