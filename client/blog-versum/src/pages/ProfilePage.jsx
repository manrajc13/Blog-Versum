import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import PageDoodles from '../components/shared/PageDoodles'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { useProfileStore } from '../store/useProfileStore'
import { useFollowStore } from '../store/useFollowStore'
import { UnfollowConfirmToast } from '../components/toasts/UnfollowConfirmToast'
import { DEFAULT_AVATAR_URL } from '../lib/defaultAvatar'

function ProfileSkeleton({ theme }) {
  const p = theme.primary
  return (
    <main className="max-w-[1180px] mx-auto w-full px-6 md:px-10 py-10 space-y-10 animate-pulse">
      <section
        className="rounded-3xl border-4 overflow-hidden"
        style={{
          borderColor: hexToRgba(p, 0.16),
          backgroundColor: hexToRgba(p, 0.05),
        }}
      >
        <div className="p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-7">
          <div className="size-36 md:size-40 rounded-full" style={{ backgroundColor: hexToRgba(p, 0.12) }} />
          <div className="flex-1 min-w-0 space-y-3 w-full">
            <div className="h-3 rounded-full w-1/4" style={{ backgroundColor: hexToRgba(p, 0.14) }} />
            <div className="h-9 rounded-xl w-2/3" style={{ backgroundColor: hexToRgba(p, 0.12) }} />
            <div className="h-5 rounded w-1/3" style={{ backgroundColor: hexToRgba(p, 0.09) }} />
          </div>
          <div className="w-full md:w-auto grid grid-cols-3 gap-2 md:min-w-[290px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-[78px]" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="h-3 rounded-full w-24" style={{ backgroundColor: hexToRgba(p, 0.13) }} />
            <div className="h-8 rounded-xl w-64" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 rounded-full" style={{ backgroundColor: hexToRgba(p, 0.1) }} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border-2 p-6" style={{ borderColor: hexToRgba(p, 0.1), backgroundColor: hexToRgba(p, 0.04) }}>
              <div className="h-5 rounded w-1/2 mb-3" style={{ backgroundColor: hexToRgba(p, 0.12) }} />
              <div className="h-4 rounded w-full mb-2" style={{ backgroundColor: hexToRgba(p, 0.08) }} />
              <div className="h-4 rounded w-4/5" style={{ backgroundColor: hexToRgba(p, 0.08) }} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

const formatJoinDate = (dateValue) => {
  if (!dateValue) return 'Joined recently'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Joined recently'
  return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
}

export default function ProfilePage({ authUser }) {
  const navigate = useNavigate()
  const { username } = useParams()
  const [queryParams] = useSearchParams()
  const theme = useThemeStore((state) => state.getTheme())
  const { fetchProfile, isfetchingProfile } = useProfileStore()
  const { sendFollowRequest, unfollow, sendingFollowRequest, unfollowing } = useFollowStore()
  const profileType = (queryParams.get('userType') || 'human').toLowerCase()

  const [profilePayload, setProfilePayload] = useState(null)
  const [isBootLoading, setIsBootLoading] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)
  const [relationStatus, setRelationStatus] = useState('none')
  const [storyFilter, setStoryFilter] = useState('public')

  const refreshProfileData = useCallback(async () => {
    const payload = await fetchProfile(username, profileType)
    setProfilePayload(payload?.message || null)
  }, [fetchProfile, profileType, username])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (mounted) {
        setIsBootLoading(true)
        setProfilePayload(null)
      }

      try {
        const payload = await fetchProfile(username, profileType)
        if (!mounted) return
        setProfilePayload(payload?.message || null)
      } catch {
        if (mounted) setProfilePayload(null)
      } finally {
        if (mounted) setIsBootLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [username, profileType, fetchProfile])

  const profile = useMemo(() => {
    const apiUser = profilePayload?.user
    const blogs = profilePayload?.blogs || []
    if (!apiUser) return null
    const isAIAuthor = (apiUser.userType || '').toLowerCase() === 'ai'

    const categoryVariants = ['purple', 'orange', 'teal']

    const mappedPosts = blogs.map((post, index) => {
      const firstBlockText = post?.content?.blocks?.find((block) => typeof block?.text === 'string')?.text || ''
      const excerpt = firstBlockText.length > 170 ? `${firstBlockText.slice(0, 167)}...` : firstBlockText
      const firstTag = post?.tags?.[0] || 'Story'
      const category = firstTag
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      return {
        id: post._id,
        slug: post.slug,
        visibility: post.visibility || 'public',
        category,
        categoryVariant: categoryVariants[index % categoryVariants.length],
        readTime: `${post.readTime || 1} min read`,
        title: post.title,
        excerpt,
        author: isAIAuthor ? apiUser.name : (apiUser.fullname || apiUser.username),
        authorAvatarUrl: post?.author?.avatar || apiUser.avatar,
        authorBgColor: 'bg-accent-teal',
        likes: String(post.likeCount ?? 0),
        comments: String(post.commentCount ?? 0),
        image: post.coverImage,
      }
    })

    const firstBlogDate = blogs
      .map((post) => post.createdAt)
      .filter(Boolean)
      .sort()[0]

    const normalizedRelationStatus =
      apiUser.isFollowing === true
        ? 'accepted'
        : apiUser.isFollowing === 'pending'
          ? 'pending'
          : apiUser.followStatus === 'accepted'
            ? 'accepted'
            : apiUser.followStatus === 'pending'
              ? 'pending'
              : 'none'

    return {
      userId: apiUser._id,
      userType: isAIAuthor ? 'AI' : 'human',
      username: apiUser.username || null,
      displayName: isAIAuthor ? apiUser.name : (apiUser.fullname || apiUser.username),
      fullName: isAIAuthor ? null : (apiUser.fullname || apiUser.username),
      avatar: apiUser.avatar,
      bio: apiUser.bio || '',
      isPrivate: Boolean(apiUser.isPrivate),
      followStatus: normalizedRelationStatus,
      joinedAt: apiUser.createdAt || firstBlogDate,
      isOwnProfile: !isAIAuthor && authUser?.username === apiUser.username,
      followingCount: apiUser.followingCount ?? 0,
      blogsCount: apiUser.numberofBlogs ?? mappedPosts.length,
      posts: mappedPosts,
      followersCountRaw: apiUser.followerCount ?? 0,
      profileIdentifier: isAIAuthor ? apiUser.name : apiUser.username,
    }
  }, [profilePayload, authUser?.username])

  useEffect(() => {
    if (!profile) return
    setRelationStatus(profile.followStatus)
    setFollowersCount(profile.followersCountRaw)
    setStoryFilter('public')
  }, [profile])

  const formatCount = (value = 0) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
    return String(value)
  }

  const filteredPosts = useMemo(() => {
    if (!profile) return []
    return profile.posts.filter((post) => post.visibility === storyFilter)
  }, [profile, storyFilter])

  const followersStoriesCount = useMemo(() => {
    if (!profile) return 0
    return profile.posts.filter((post) => post.visibility === 'followers').length
  }, [profile])

  const publicStoriesCount = useMemo(() => {
    if (!profile) return 0
    return profile.posts.filter((post) => post.visibility === 'public').length
  }, [profile])

  const handleFollowAction = async (event) => {
    if (!profile || profile.isOwnProfile || sendingFollowRequest || unfollowing) return

    const followingType = profile.userType === 'AI' ? 'AI' : 'user'
    const clickPosition = {
      x: event?.clientX ?? event?.currentTarget?.getBoundingClientRect?.().left ?? 0,
      y: event?.clientY ?? event?.currentTarget?.getBoundingClientRect?.().bottom ?? 0,
    }

    if (relationStatus === 'accepted') {
      toast.custom((t) => (
        <UnfollowConfirmToast
          borderColor={hexToRgba(theme.primary, 0.2)}
          primaryColor={theme.primary}
          clickPosition={clickPosition}
          onCancel={() => toast.dismiss(t.id)}
          onConfirm={async () => {
            toast.dismiss(t.id)
            try {
              const response = await unfollow({ userId: profile.userId, followingType })
              await refreshProfileData()
              toast.success(response?.message || 'Unfollowed successfully')
            } catch (error) {
              toast.error(error?.response?.data?.message || 'Failed to unfollow')
            }
          }}
        />
      ))
      return
    }

    if (relationStatus === 'pending') {
      return
    }

    try {
      const response = await sendFollowRequest({ userId: profile.userId, followingType })
      await refreshProfileData()
      const nextStatus = profile.isPrivate && profile.userType !== 'AI' ? 'pending' : 'accepted'
      toast.success(response?.message || (nextStatus === 'pending' ? 'Follow request sent' : 'Followed successfully'))
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to follow profile')
    }
  }

  const followButtonLabel =
    relationStatus === 'pending'
      ? 'Requested'
      : relationStatus === 'accepted'
        ? 'Following'
        : 'Follow'

  if (!profile) {
    if (isfetchingProfile || isBootLoading) {
      return (
        <div className="text-slate-900 dark:text-slate-100 min-h-screen" style={{ backgroundColor: theme.homeBackground }}>
          <div className="layout-container flex h-full grow flex-col">
            <Navbar
              iconColor={theme.primary}
              activeLink="Home"
              navLinks={[
                { label: 'Home', to: '/home' },
                { label: 'Explore', to: '#' },
                { label: 'My Journal', to: '/journal' },
                { label: 'Settings', to: '/settings' },
              ]}
              avatarUrl={authUser?.avatar}
            />

            <ProfileSkeleton theme={theme} />

            <Footer iconColor={theme.primary} />
          </div>
        </div>
      )
    }

    return (
      <div className="text-slate-900 dark:text-slate-100 min-h-screen" style={{ backgroundColor: theme.homeBackground }}>
        <div className="layout-container flex h-full grow flex-col">
          <Navbar
            iconColor={theme.primary}
            activeLink="Home"
            navLinks={[
              { label: 'Home', to: '/home' },
              { label: 'Explore', to: '#' },
              { label: 'My Journal', to: '/journal' },
              { label: 'Settings', to: '/settings' },
            ]}
            avatarUrl={authUser?.avatar}
          />

          <main className="max-w-[1180px] mx-auto w-full px-6 md:px-10 py-10 text-center">
            <span className="material-symbols-outlined text-7xl" style={{ color: hexToRgba(theme.primary, 0.35) }}>person_search</span>
            <h1 className="text-3xl font-extrabold mt-3">Profile not found</h1>
            <button
              onClick={() => navigate('/home')}
              className="mt-6 rounded-full px-8 py-3 text-sm font-black text-white"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 6px 0 ${hexToRgba(theme.primary, 0.78)}`,
              }}
            >
              Back Home
            </button>
          </main>

          <Footer iconColor={theme.primary} />
        </div>
      </div>
    )
  }

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen relative" style={{ backgroundColor: theme.homeBackground }}>
      <PageDoodles variant="corners" />

      <div className="layout-container flex h-full grow flex-col relative z-10">
        <Navbar
          iconColor={theme.primary}
          activeLink={null}
          navLinks={[
            { label: 'Home', to: '/home' },
            { label: 'Explore', to: '#' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings', to: '/settings' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        <main className="max-w-[1180px] mx-auto w-full px-6 md:px-10 py-10 space-y-10">
          <section
            className="rounded-3xl border-4 overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${hexToRgba(theme.primary, 0.12)} 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.98) 100%)`,
              borderColor: hexToRgba(theme.primary, 0.22),
              boxShadow: `0 20px 50px ${hexToRgba(theme.primary, 0.18)}`,
            }}
          >
            <div className="p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-7">
              <div className="relative shrink-0">
                <div
                  className="size-36 md:size-40 rounded-full overflow-hidden border-[6px] shadow-xl"
                  style={{ borderColor: hexToRgba(theme.primary, 0.26) }}
                >
                  <img src={profile.avatar || DEFAULT_AVATAR_URL} alt={profile.username} className="w-full h-full object-cover" />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 flex items-center justify-center size-10 rounded-full border-2"
                  style={{
                    borderColor: '#fff',
                    color: theme.primary,
                    backgroundColor: hexToRgba(theme.primary, 0.15),
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {profile.userType === 'AI' ? 'smart_toy' : 'ink_pen'}
                  </span>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] font-black" style={{ color: hexToRgba(theme.primary, 0.7) }}>
                  {profile.userType === 'AI' ? 'AI Creator Profile' : 'Creator Profile'}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold bouncy-text text-slate-900 mt-1 truncate">
                  {profile.displayName}
                </h1>
                {profile.userType === 'AI' ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border"
                      style={{
                        color: '#0f766e',
                        backgroundColor: '#ccfbf1',
                        borderColor: '#5eead4',
                      }}
                    >
                      <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                      AI Author
                    </span>
                    <span className="text-sm font-bold text-slate-500">Cartoon Brain, Serious Stories.</span>
                  </div>
                ) : (
                  <>
                    <p className="text-base font-bold text-slate-500 mt-1">@{profile.username}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2">{profile.fullName}</p>
                  </>
                )}

                {profile.bio && (
                  <p className="text-sm font-bold text-slate-500 mt-3 line-clamp-2">{profile.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className="text-xs font-black px-3 py-1 rounded-full border"
                    style={{
                      color: theme.primary,
                      borderColor: hexToRgba(theme.primary, 0.25),
                      backgroundColor: hexToRgba(theme.primary, 0.08),
                    }}
                  >
                    {formatJoinDate(profile.joinedAt)}
                  </span>
                  {!profile.isOwnProfile && (
                    <button
                      onClick={handleFollowAction}
                      disabled={sendingFollowRequest || unfollowing || relationStatus === 'pending'}
                      className="text-xs font-black px-4 py-1.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95"
                      style={
                        relationStatus === 'accepted'
                          ? {
                              color: theme.primary,
                              borderColor: hexToRgba(theme.primary, 0.32),
                              backgroundColor: hexToRgba(theme.primary, 0.08),
                            }
                          : relationStatus === 'pending'
                            ? {
                                color: hexToRgba(theme.primary, 0.8),
                                borderColor: hexToRgba(theme.primary, 0.2),
                                backgroundColor: hexToRgba(theme.primary, 0.06),
                                opacity: 0.75,
                              }
                          : {
                              color: '#fff',
                              borderColor: theme.primary,
                              backgroundColor: theme.primary,
                              boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.75)}`,
                            }
                      }
                    >
                      {sendingFollowRequest || unfollowing ? 'Please wait...' : followButtonLabel}
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto grid grid-cols-3 gap-2 md:min-w-[290px]">
                <div
                  className="rounded-2xl border-2 px-3 py-3"
                  style={{
                    borderColor: hexToRgba(theme.primary, 0.18),
                    backgroundColor: hexToRgba(theme.primary, 0.06),
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Blogs</p>
                  <p className="text-lg font-extrabold" style={{ color: theme.primary }}>{profile.blogsCount}</p>
                </div>
                <div
                  className="rounded-2xl border-2 px-3 py-3"
                  style={{
                    borderColor: hexToRgba(theme.primary, 0.18),
                    backgroundColor: hexToRgba(theme.primary, 0.06),
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Followers</p>
                  <p className="text-lg font-extrabold" style={{ color: theme.primary }}>{formatCount(followersCount)}</p>
                </div>
                <div
                  className="rounded-2xl border-2 px-3 py-3"
                  style={{
                    borderColor: hexToRgba(theme.primary, 0.18),
                    backgroundColor: hexToRgba(theme.primary, 0.06),
                  }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Following</p>
                  <p className="text-lg font-extrabold" style={{ color: theme.primary }}>{profile.followingCount}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-black" style={{ color: hexToRgba(theme.primary, 0.58) }}>
                  Story Shelf
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold bouncy-text">{profile.displayName}'s Posts</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {[
                  { key: 'public', label: `Public (${publicStoriesCount})` },
                  { key: 'followers', label: `Followers (${followersStoriesCount})` },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStoryFilter(filter.key)}
                    className="text-xs font-black px-4 py-2 rounded-full border-2 transition-all hover:scale-105"
                    style={
                      storyFilter === filter.key
                        ? {
                            color: '#fff',
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                            boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.7)}`,
                          }
                        : {
                            color: theme.primary,
                            backgroundColor: hexToRgba(theme.primary, 0.08),
                            borderColor: hexToRgba(theme.primary, 0.22),
                          }
                    }
                  >
                    {filter.label}
                  </button>
                ))}
                <span
                  className="text-sm font-black px-4 py-2 rounded-full"
                  style={{
                    color: theme.primary,
                    backgroundColor: hexToRgba(theme.primary, 0.1),
                  }}
                >
                  {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {filteredPosts.length === 0 && (
                <div
                  className="rounded-2xl border-2 p-8 text-center"
                  style={{
                    borderColor: hexToRgba(theme.primary, 0.2),
                    backgroundColor: hexToRgba(theme.primary, 0.05),
                  }}
                >
                  <span className="material-symbols-outlined text-4xl" style={{ color: hexToRgba(theme.primary, 0.45) }}>shelf_position</span>
                  <p className="font-extrabold text-slate-500 mt-2">No {storyFilter} posts yet.</p>
                </div>
              )}

              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id || post.slug}
                  category={post.category}
                  categoryVariant={post.categoryVariant}
                  readTime={post.readTime}
                  title={post.title}
                  excerpt={post.excerpt}
                  author={post.author}
                  authorAvatarUrl={post.authorAvatarUrl}
                  authorBgColor={post.authorBgColor}
                  likes={post.likes}
                  comments={post.comments}
                  image={post.image}
                  onClick={() =>
                    navigate(`/blog/${post.slug || post.id}`, {
                      state: {
                        from: 'profile',
                        backLabel: profile.userType === 'AI' ? 'AI Author Profile' : 'User Profile',
                        profileUrl: `/profile/${encodeURIComponent(profile.profileIdentifier)}?userType=${profile.userType}`,
                      },
                    })
                  }
                />
              ))}
            </div>
          </section>
        </main>

        <Footer iconColor={theme.primary} />
      </div>
    </div>
  )
}
