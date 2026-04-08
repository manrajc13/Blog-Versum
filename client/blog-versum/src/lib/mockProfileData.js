const FALLBACK_AVATAR = 'https://i.pravatar.cc/200?img=19'

const MOCK_USERS = [
  {
    username: 'StoryCrafter',
    fullName: 'Aria Storycrafter',
    email: 'storycrafter@blogverse.app',
    joinedAt: '2026-03-12',
    avatar: 'https://i.pravatar.cc/200?img=19',
    followers: ['WhimsicalWilla', 'PixelPete', 'InklingIvy', 'DoodleNova'],
    following: ['CoffeeCat', 'ScriptedSun', 'PagePilot', 'VerseVoyager'],
  },
  {
    username: 'WhimsicalWilla',
    fullName: 'Willa Harper',
    email: 'willa@blogverse.app',
    joinedAt: '2025-11-03',
    avatar: 'https://i.pravatar.cc/200?img=3',
    followers: ['StoryCrafter', 'CoffeeCat', 'PagePilot'],
    following: ['StoryCrafter', 'PixelPete'],
  },
  {
    username: 'PixelPete',
    fullName: 'Peter Lin',
    email: 'pete@blogverse.app',
    joinedAt: '2025-12-19',
    avatar: 'https://i.pravatar.cc/200?img=12',
    followers: ['StoryCrafter', 'WhimsicalWilla'],
    following: ['StoryCrafter', 'CoffeeCat', 'DoodleNova'],
  },
  {
    username: 'CoffeeCat',
    fullName: 'Mira Cole',
    email: 'coffeecat@blogverse.app',
    joinedAt: '2024-08-26',
    avatar: 'https://i.pravatar.cc/200?img=5',
    followers: ['StoryCrafter', 'ScriptedSun'],
    following: ['StoryCrafter'],
  },
  {
    username: 'DoodleNova',
    fullName: 'Nova Reed',
    email: 'doodlenova@blogverse.app',
    joinedAt: '2025-06-04',
    avatar: 'https://i.pravatar.cc/200?img=33',
    followers: ['StoryCrafter'],
    following: ['StoryCrafter', 'WhimsicalWilla'],
  },
]

const MOCK_PROFILE_POSTS = [
  {
    id: 'sp1',
    slug: 'ink-magic-field-notes',
    authorUsername: 'StoryCrafter',
    visibility: 'public',
    category: 'Adventure',
    categoryVariant: 'teal',
    readTime: '6 min read',
    title: 'Ink Magic Field Notes From The Paper Forest',
    excerpt: 'A cozy dispatch from the edge of the map, where every doodle leaves a footprint.',
    authorBgColor: 'bg-accent-teal',
    likes: '1.4k',
    comments: '86',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sp2',
    slug: 'midnight-teacup-memoirs',
    authorUsername: 'StoryCrafter',
    visibility: 'followers',
    category: 'Lifestyle',
    categoryVariant: 'orange',
    readTime: '4 min read',
    title: 'Midnight Teacup Memoirs: Letters To Future Me',
    excerpt: 'The kettle sings, the page listens, and courage arrives one paragraph at a time.',
    authorBgColor: 'bg-purple-400',
    likes: '942',
    comments: '29',
    image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'wp1',
    slug: 'petal-letters',
    authorUsername: 'WhimsicalWilla',
    visibility: 'public',
    category: 'Fiction',
    categoryVariant: 'purple',
    readTime: '5 min read',
    title: 'Petal Letters From A Sidewalk Garden',
    excerpt: 'A gentle story about ordinary places turning extraordinary when we look twice.',
    authorBgColor: 'bg-pink-400',
    likes: '1.1k',
    comments: '57',
    image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pp1',
    slug: 'pixel-rain',
    authorUsername: 'PixelPete',
    visibility: 'followers',
    category: 'Tech',
    categoryVariant: 'teal',
    readTime: '7 min read',
    title: 'When Pixel Rain Met Fountain Pens',
    excerpt: 'Code and sketchbooks collide in a rainy-night experiment for creative thinkers.',
    authorBgColor: 'bg-blue-400',
    likes: '784',
    comments: '41',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cc1',
    slug: 'coffee-oracles',
    authorUsername: 'CoffeeCat',
    visibility: 'public',
    category: 'Daily',
    categoryVariant: 'orange',
    readTime: '3 min read',
    title: 'Coffee Oracles And The Art Of Tiny Rituals',
    excerpt: 'How little morning habits can anchor your biggest creative days.',
    authorBgColor: 'bg-amber-400',
    likes: '651',
    comments: '17',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  },
]

const formatFollowersCount = (count) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return String(count)
}

const normalizePerson = (username) => {
  const user = MOCK_USERS.find((entry) => entry.username.toLowerCase() === username.toLowerCase())
  if (!user) {
    return {
      username,
      fullName: username,
      email: `${username.toLowerCase()}@blogverse.app`,
      joinedAt: '2026-01-01',
      avatar: FALLBACK_AVATAR,
      followers: [],
      following: [],
    }
  }
  return user
}

export function getMockProfileByUsername(rawUsername, rawViewerUsername = 'StoryCrafter') {
  const username = decodeURIComponent(rawUsername || '').trim()
  if (!username) return null

  const person = normalizePerson(username)
  const viewer = normalizePerson(rawViewerUsername)
  const authoredPosts = MOCK_PROFILE_POSTS.filter((post) => post.authorUsername.toLowerCase() === person.username.toLowerCase())
  const isOwnProfile = viewer.username.toLowerCase() === person.username.toLowerCase()
  const isFollowing = !isOwnProfile && viewer.following.some((name) => name.toLowerCase() === person.username.toLowerCase())

  return {
    username: person.username,
    fullName: person.fullName,
    email: person.email,
    joinedAt: person.joinedAt,
    avatar: person.avatar,
    isOwnProfile,
    isFollowing,
    viewerUsername: viewer.username,
    followersCountRaw: person.followers.length,
    followingCountRaw: person.following.length,
    followersCount: formatFollowersCount(person.followers.length),
    followingCount: formatFollowersCount(person.following.length),
    blogsCount: authoredPosts.length,
    followersList: person.followers.map((name) => normalizePerson(name)),
    followingList: person.following.map((name) => normalizePerson(name)),
    posts: authoredPosts.map((post) => ({
      ...post,
      author: person.fullName,
    })),
  }
}
