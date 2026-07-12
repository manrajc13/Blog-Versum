import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import PageDoodles from '../components/shared/PageDoodles'
import { useThemeStore } from '../store/useThemeStore'
import { useFollowStore } from '../store/useFollowStore'
import { hexToRgba } from '../store/themeConfig'
import { useFeedStore } from '../store/useFeedStore'
import { getFallbackCoverImage } from '../lib/fallbackCoverImages'

const BLOG_POSTS = [
  {
    id: 1,
    category: 'Adventure',
    categoryVariant: 'purple',
    readTime: '5 min read',
    title: "My First Doodle Story: Ink & Magic",
    excerpt: "A whimsical journey through the land of living ink and paper forests. What happens when your drawings come to life?",
    author: 'ArtistAnnie',
    authorBgColor: 'bg-accent-teal',
    likes: '1.2k',
    comments: '48',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgdl637JFCoBXP_kWH_MTBkXL2VApbfMRUL9DVpHR8jlA4Y6Nt7FzIB6JLVIaSknItI9vYVG4LIURVLfkqVM6LaE0VRB7i6uaFryXEq7LgidtXlFAB1YiPRX1tkon7FoAcJS4QtiAyXRqKcSSfkpfNE-1IrE-k37tjjBbgyS8D4vNtjMcMwvWHkxJjR5vwlZpwIhGbbsJnSL-yH3UoclGJpnopna5XwSL8HoL-bY7butzNyZ0UEEgQM-2aDDq75daHWGIxYRQ3BA',
  },
  {
    id: 2,
    category: 'Lifestyle',
    categoryVariant: 'orange',
    readTime: '3 min read',
    title: "The Secret Life of Coffee Mugs",
    excerpt: "They see us before we've had our caffeine. They hold our secrets (and our dark roasts). It's time to listen to their stories.",
    author: 'CoffeeCat',
    authorBgColor: 'bg-purple-400',
    likes: '856',
    comments: '24',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl9gYfmoxN70h4IKA_MtIEYelT-6Fu1coFi674AZSWnuuls0mVBhmyenE5HkfXQsHvVhscOT8O0CY1tlp-Ab8576BlIzHEL0B2r5mcr2C30c4Idg57DlQFpBZMKH2qTBuc3INJeTcbwkX3D4ZAsiYRIT6bbsOqY1mDhfD7OKQegOoMmBYWpOXqq-mhdFo_LcHsV1bhmCS65VSjwtvdqwf_zvDte753LMAaiw29j6WMolFmKx9MrIkpRkqBQoWSOExrLgM6Twt8Cw',
  },
]

const FEED_TABS = ['For You', 'Following', 'Popular']

const TRENDING_TOPICS = [
  { tag: '#Storytelling', color: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200' },
  { tag: '#Doodles', color: 'bg-teal-100 text-teal-600 border-teal-200 hover:bg-teal-200' },
  { tag: '#Fiction', color: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200' },
  { tag: '#Magic', color: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200' },
  { tag: '#ArtTips', color: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' },
  { tag: '#DailyBlog', color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' },
]

export default function Home({authUser}) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('For You')
  const theme = useThemeStore((state) => state.getTheme())
  const { fetchHomeFeed, isfetchingHomeFeed } = useFeedStore()
  const [feedData, setFeedData] = useState({ recommended: [], following: [], popular: [] })
  const [feedError, setFeedError] = useState(false)
  const { fetchPendingRequests } = useFollowStore()
  const [hasLoadedFeed, setHasLoadedFeed] = useState(false)
  const [notifications, setNotifications] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadHomeFeed = async () => {
      try {
        const payload = await fetchHomeFeed()
        if (!mounted) return
        setFeedData({
          recommended: payload?.recommended || [],
          following: payload?.following || [],
          popular: payload?.popular || [],
        })
        setFeedError(false)
      } catch {
        if (!mounted) return
        setFeedError(true)
      } finally {
        if (!mounted) return
        setHasLoadedFeed(true)
      }
    }

    const loadNotifications = async () => {
      try {
        const pendingRequests = await fetchPendingRequests();
        const hasPendingRequests = Array.isArray(pendingRequests?.requests) && pendingRequests.requests.length > 0
        setNotifications(hasPendingRequests)
      } catch (error) {
        console.error("Error loading notifications: ", error);
        setNotifications(false)
      }
    }

    loadHomeFeed()
    loadNotifications()

    return () => {
      mounted = false
    }
  }, [fetchHomeFeed, fetchPendingRequests])

  const fallbackCards = useMemo(
    () => BLOG_POSTS.map((post) => ({ ...post, authorTypeLabel: 'HUMAN' })),
    []
  )

  const activeFeedCards = useMemo(() => {
    if (feedError) return fallbackCards

    if (activeTab === 'For You') return feedData.recommended
    if (activeTab === 'Following') return feedData.following
    if (activeTab === 'Popular') return feedData.popular
    return []
  }, [activeTab, feedData, feedError, fallbackCards])

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.homeBackground }}>
      <PageDoodles variant="sparse" />
      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          activeLink="Home"
          onNotificationClick={() => navigate('/settings?tab=Notifications')}
          navLinks={[
            { label: 'Home', to: '/home' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings', to: '/settings' },
            { label: 'Explore', to: '/explore'}
          ]}
          notification_active={notifications}
          avatarUrl={authUser?.avatar}
        />

        <main className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-8">

          {/* Hero Section */}
          <section
            className="rounded-xl p-8 mb-12 flex flex-col md:flex-row items-center gap-10 border-4 shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(theme.primary, 0.08)} 0%, rgba(255, 255, 255, 0.85) 100%)`,
              borderColor: hexToRgba(theme.primary, 0.2),
            }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">edit_note</span>
            </div>

            {/* Hero Image */}
            <div className="w-full md:w-1/2 aspect-video bg-white rounded-xl shadow-lg border-2 overflow-hidden" style={{ borderColor: hexToRgba(theme.primary, 0.25) }}>
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC5YbZAAoXZEgs09fIk-Guo1WmXmZKWPkRxldHWBQoqm541COwPMheM3Dd5iY6QpNu-j80a7gBqKy3VTl4gAXmjfwYkiYuIzkvD-ZX-Z6rh4VnVGLUaq6SsJrsFX7Nzo9B9JThJg58SbRJXTUivkg8pZa9HyrQWPXu0JPMybce5hGULtUZTUgKArGX8nteFKCD2pyYl2pBVUvLKrYd6f1Gm38WSAER1TS1fsKNXxd36FMhmFQ0K7J6ckuK9KBNYRz0a0kHnsr-tw"
                alt="Cartoon character writing in a giant notebook with a large quill"
              />
            </div>

            {/* Hero Text */}
            <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight bouncy-text">
                Welcome to <span className="italic" style={{ color: theme.primary }}>BlogVerse!</span><br />
                Start Writing Your Story
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Unleash your creativity on the most whimsical writing platform in the universe.
              </p>
              <button
                className="text-white font-extrabold py-4 px-8 rounded-full active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 mx-auto md:mx-0"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 6px 0 ${hexToRgba(theme.primary, 0.75)}`,
                }}
                onClick={() => navigate('/journal/create')}
              >
                <span className="material-symbols-outlined">edit</span>
                CREATE NEW POST
              </button>
            </div>
          </section>

          {/* Feed + Sidebar */}
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main Feed */}
            <div className="flex-1 space-y-8">
              {/* Feed Tabs */}
              <div className="flex items-center justify-between border-b-2 pb-4" style={{ borderBottomColor: hexToRgba(theme.primary, 0.22) }}>
                <div className="flex gap-6">
                  {FEED_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`font-bold pb-4 transition-colors border-b-4 ${activeTab === tab ? '' : 'text-slate-500 border-transparent'}`}
                      style={
                        activeTab === tab
                          ? {
                            color: theme.primary,
                            borderBottomColor: theme.primary,
                          }
                          : {}
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blog Cards */}
              {(!hasLoadedFeed || isfetchingHomeFeed) && !feedError && (
                <div className="rounded-xl border-2 bg-white p-6" style={{ borderColor: hexToRgba(theme.primary, 0.16) }}>
                  <p className="font-extrabold" style={{ color: theme.primary }}>Loading your feed...</p>
                </div>
              )}

              {hasLoadedFeed && !isfetchingHomeFeed && activeFeedCards.length === 0 && (
                <div className="rounded-xl border-2 bg-white p-6" style={{ borderColor: hexToRgba(theme.primary, 0.16) }}>
                  <p className="font-extrabold" style={{ color: theme.primary }}>No Posts under this tab yet!</p>
                </div>
              )}

              {!isfetchingHomeFeed && activeFeedCards.map((post, index) => (
                <BlogCard
                key={post.id || `${activeTab}-${index}`}
                category={post.category || (post.tags?.[0] ? String(post.tags[0]).replace(/(^.|-.)/g, (m) => m.replace('-', '').toUpperCase()) : 'Story')}
                categoryVariant={post.categoryVariant || ['purple', 'orange', 'teal'][index % 3]}
                readTime={post.readTime}
                title={post.title}
                excerpt={post.excerpt}
                author={post.authorName || post.author}
                authorAvatarUrl={post.authorAvatarUrl || post.avatar}
                authorTypeLabel={post.authorTypeLabel}
                authorBgColor={post.authorBgColor || 'bg-accent-teal'}
                likes={typeof post.likes === 'number' ? String(post.likes) : post.likes}
                comments={typeof post.comments === 'number' ? String(post.comments) : post.comments}
                image={post.image || getFallbackCoverImage(post.slug || post.id || post.title)}
                onClick={() => {
                  const target = post.slug || post.id
                  if (!target) return
                  navigate(`/blog/${target}`)
                }}
                />
              ))}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-8">
              {/* Trending Topics */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-4" style={{ borderColor: hexToRgba(theme.primary, 0.25) }}>
                <h4 className="text-xl font-extrabold bouncy-text mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ color: theme.primary }}>temp_preferences_custom</span>
                  Trending Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map(({ tag, color }) => (
                    <span
                      key={tag}
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 cursor-pointer transition-colors ${color}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Prompt */}
              <div className="text-white p-6 rounded-xl rotate-1 shadow-lg" style={{ backgroundColor: theme.primary }}>
                <h4 className="text-xl font-extrabold bouncy-text mb-3">Daily Prompt! ✨</h4>
                <p className="text-white/90 text-sm italic mb-4">
                  &ldquo;If your favorite food could talk, what&apos;s the first thing it would say?&rdquo;
                </p>
                <button className="w-full bg-white text-primary font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Write Now
                </button>
              </div>

              {/* Star Authors */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-4 border-slate-100 dark:border-slate-800">
                <h4 className="text-xl font-extrabold bouncy-text mb-6">Star Authors</h4>
                <div className="space-y-4">
                  {[
                    { name: 'WhimsicalWilla', followers: '12.4k followers', color: 'bg-amber-400' },
                    { name: 'PixelPete', followers: '8.9k followers', color: 'bg-blue-400' },
                  ].map(({ name, followers, color }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${color} border-2 border-white shadow-sm`}></div>
                        <div>
                          <p className="font-bold text-sm">{name}</p>
                          <p className="text-xs text-slate-500">{followers}</p>
                        </div>
                      </div>
                      <button className="font-bold text-xs uppercase tracking-wider" style={{ color: theme.primary }}>Follow</button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}
