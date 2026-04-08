/**
 * TopicDeck.jsx
 *
 * Full-width centered card deck with scroll-based navigation.
 * - Cards are absolutely layered; the topmost card is the active topic.
 * - Mouse wheel scroll navigates: down = next topic, up = previous topic.
 * - Active card has a "Discover Stories" button to reveal blog posts.
 * - Warm, cosy aesthetic with hand-drawn feel.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useThemeStore } from '../../store/useThemeStore'
import { hexToRgba } from '../../store/themeConfig'

const VISIBLE_COUNT = 4

export default function TopicDeck({ topics, activeTopic, onTopicChange, onDiscoverStories }) {
  const theme = useThemeStore((state) => state.getTheme())
  const [flyingId, setFlyingId] = useState(null)
  const [flyDirection, setFlyDirection] = useState('next')
  const [deckOrder, setDeckOrder] = useState(() => topics.map((t) => t.id))
  const containerRef = useRef(null)
  const lastScrollTime = useRef(0)

  // Sync deck order when activeTopic changes from outside (e.g., Quick Jump)
  useEffect(() => {
    if (activeTopic && activeTopic.id !== deckOrder[0]) {
      setDeckOrder((prev) => {
        const idx = prev.indexOf(activeTopic.id)
        if (idx === -1 || idx === 0) return prev
        const next = [...prev]
        next.splice(idx, 1)
        next.unshift(activeTopic.id)
        return next
      })
    }
  }, [activeTopic?.id])

  const navigateNext = useCallback(() => {
    if (flyingId) return
    const currentTopId = deckOrder[0]
    setFlyDirection('next')
    setFlyingId(currentTopId)

    setTimeout(() => {
      let newTopId = null
      setDeckOrder((prev) => {
        const next = [...prev]
        const first = next.shift()
        next.push(first)
        newTopId = next[0]
        return next
      })
      // Call onTopicChange outside of setDeckOrder to avoid setState-in-render error
      setTimeout(() => {
        if (newTopId) onTopicChange(newTopId)
      }, 0)
      setFlyingId(null)
    }, 380)
  }, [flyingId, deckOrder, onTopicChange])

  const navigatePrev = useCallback(() => {
    if (flyingId) return
    setFlyDirection('prev')
    const lastId = deckOrder[deckOrder.length - 1]
    setFlyingId(lastId)

    setTimeout(() => {
      let newTopId = null
      setDeckOrder((prev) => {
        const next = [...prev]
        const last = next.pop()
        next.unshift(last)
        newTopId = next[0]
        return next
      })
      // Call onTopicChange outside of setDeckOrder to avoid setState-in-render error
      setTimeout(() => {
        if (newTopId) onTopicChange(newTopId)
      }, 0)
      setFlyingId(null)
    }, 380)
  }, [flyingId, deckOrder, onTopicChange])

  useEffect(() => {
    const handleWheel = (e) => {
      // Prevent page scroll when interacting with the card deck
      e.preventDefault()

      const now = Date.now()
      if (now - lastScrollTime.current < 500) return
      lastScrollTime.current = now

      if (e.deltaY > 0) {
        navigateNext()
      } else if (e.deltaY < 0) {
        navigatePrev()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        navigateNext()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        navigatePrev()
      }
    }

    const container = containerRef.current
    if (container) {
      // passive: false allows us to call preventDefault()
      container.addEventListener('wheel', handleWheel, { passive: false })
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigateNext, navigatePrev])

  const visibleIds = deckOrder.slice(0, VISIBLE_COUNT)

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Navigation hint */}
      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
        <span className="material-symbols-outlined text-lg" style={{ color: hexToRgba(theme.primary, 0.5) }}>
          mouse
        </span>
        <span>Scroll on cards to explore topics</span>
      </div>

      {/* Deck wrapper - scroll listener only on this element */}
      <div
        id="topic-deck"
        ref={containerRef}
        className="relative select-none w-full max-w-3xl mx-auto cursor-grab active:cursor-grabbing"
        style={{ height: 340 }}
        aria-label="Topic card deck"
      >
        {[...visibleIds].reverse().map((id, reversedIdx) => {
          const stackIdx = VISIBLE_COUNT - 1 - reversedIdx
          const topic = topics.find((t) => t.id === id)
          if (!topic) return null

          const isActive = stackIdx === 0
          const isFlying = flyingId === id

          const offsetY = stackIdx * 12
          const rotate = stackIdx * 1.2 * (stackIdx % 2 === 0 ? 1 : -1)
          const scale = 1 - stackIdx * 0.03
          const zIndex = VISIBLE_COUNT - stackIdx

          const baseTransform = `
            translateY(${offsetY}px)
            rotate(${rotate}deg)
            scale(${scale})
          `
          const flyNextTransform = `
            translateY(-150px)
            translateX(100px)
            rotate(${rotate + 15}deg)
            scale(${scale * 0.85})
          `
          const flyPrevTransform = `
            translateY(150px)
            translateX(-100px)
            rotate(${rotate - 15}deg)
            scale(${scale * 0.85})
          `

          let currentTransform = baseTransform
          if (isFlying && flyDirection === 'next' && isActive) {
            currentTransform = flyNextTransform
          } else if (isFlying && flyDirection === 'prev' && id === deckOrder[deckOrder.length - 1]) {
            currentTransform = flyPrevTransform
          }

          return (
            <div
              key={id}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: `translateX(-50%) ${currentTransform}`,
                width: '100%',
                maxWidth: '720px',
                height: 300,
                borderRadius: 28,
                zIndex,
                transition: isFlying
                  ? 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s'
                  : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                opacity: isFlying ? 0 : 1,
                background: `linear-gradient(145deg, ${topic.bgFrom}, ${topic.bgTo})`,
                boxShadow: isActive
                  ? `0 20px 50px ${hexToRgba(topic.bgFrom, 0.4)}, 0 8px 20px rgba(0,0,0,0.15)`
                  : `0 8px 24px rgba(0,0,0,0.1)`,
                overflow: 'hidden',
                userSelect: 'none',
                border: `3px solid ${hexToRgba(topic.bgFrom, 0.3)}`,
              }}
            >
              {/* Decorative background icon */}
              <span
                className="material-symbols-outlined absolute -bottom-6 -right-6 pointer-events-none select-none"
                style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12rem' }}
              >
                {topic.icon}
              </span>

              {/* Card content */}
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl md:text-6xl" role="img" aria-label={topic.label}>
                      {topic.emoji}
                    </span>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white bouncy-text leading-tight">
                        {topic.label}
                      </h3>
                      {isActive && (
                        <p className="text-base md:text-lg font-medium mt-2 max-w-md" style={{ color: 'rgba(255,255,255,0.85)' }}>
                          {topic.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="text-xs font-black px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                      >
                        {topic.posts?.length || 0} stories
                      </span>
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                    {/* Navigation arrows */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={navigatePrev}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        aria-label="Previous topic"
                      >
                        <span className="material-symbols-outlined text-white text-xl">arrow_upward</span>
                      </button>
                      <button
                        onClick={navigateNext}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        aria-label="Next topic"
                      >
                        <span className="material-symbols-outlined text-white text-xl">arrow_downward</span>
                      </button>
                    </div>

                    {/* Discover Stories CTA */}
                    <button
                      onClick={() => onDiscoverStories?.(topic)}
                      className="group flex items-center gap-3 bg-white font-extrabold py-3 px-6 md:px-8 rounded-full text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
                      style={{
                        color: topic.bgFrom,
                        boxShadow: `0 6px 0 ${hexToRgba(topic.bgFrom, 0.3)}, 0 8px 20px rgba(0,0,0,0.15)`,
                      }}
                    >
                      <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                        auto_stories
                      </span>
                      Discover Stories
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-4">
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === deckOrder[0]) return
              const idx = deckOrder.indexOf(t.id)
              if (idx === -1) return

              setDeckOrder((prev) => {
                const next = [...prev]
                next.splice(idx, 1)
                next.unshift(t.id)
                return next
              })
              // Call onTopicChange outside of setDeckOrder to avoid setState-in-render error
              setTimeout(() => onTopicChange(t.id), 0)
            }}
            aria-label={`Go to ${t.label}`}
            className="transition-all duration-300"
            style={{
              width: deckOrder[0] === t.id ? 28 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:
                deckOrder[0] === t.id
                  ? theme.primary
                  : hexToRgba(theme.primary, 0.25),
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-400 font-medium mt-2">
        or use{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono">
          ↑
        </kbd>{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono">
          ↓
        </kbd>{' '}
        arrows
      </p>
    </div>
  )
}
