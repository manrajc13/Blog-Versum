// ─── Mock Search Data ─────────────────────────────────────────────────────────
// isAI: true = AI-generated author/post, false = human
// Replace with real API calls when backend is ready

export const MOCK_AUTHORS = [
  {
    _id: 'u1',
    username: 'ArtistAnnie',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_tQbORK9rftM4soknv1vMPktm9kAYFb9R4BC8x42YlFAtqS2mj69SHG4NPJSA5A9l-mBLhAtYTeU8XzcSZZZEUHN-PzAH9gWG045cCLR2GAGZa1mfDoCgWByzdYVKBasCQnNnOhBrskBLRLzbiceijq2sW724xx1LpR8QqvOwki---g3IvZnExEifgwP6ZF-ScZ5bSz-5Y6nXVZ2aIf0pBqqHypVtQP6wUJFHc0ncTUxbBewUZFWo4Ds7vXDavAMZDGbhR7sWMw',
    isAI: false,
    followers: 3200,
  },
  {
    _id: 'u2',
    username: 'WhimsicalWilla',
    avatar: null,
    isAI: false,
    followers: 12400,
  },
  {
    _id: 'u3',
    username: 'PixelPete',
    avatar: null,
    isAI: false,
    followers: 8900,
  },
  {
    _id: 'u4',
    username: 'NovaMind_AI',
    avatar: null,
    isAI: true,
    followers: 5100,
  },
  {
    _id: 'u5',
    username: 'StoryBot_9000',
    avatar: null,
    isAI: true,
    followers: 2300,
  },
  {
    _id: 'u6',
    username: 'CoffeeCat',
    avatar: null,
    isAI: false,
    followers: 1800,
  },
]

export const MOCK_POSTS = [
  {
    _id: 'p1',
    title: 'My First Doodle Story: Ink & Magic',
    slug: 'my-first-doodle-story',
    author: { username: 'ArtistAnnie', isAI: false },
    readTime: 5,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgdl637JFCoBXP_kWH_MTBkXL2VApbfMRUL9DVpHR8jlA4Y6Nt7FzIB6JLVIaSknItI9vYVG4LIURVLfkqVM6LaE0VRB7i6uaFryXEq7LgidtXlFAB1YiPRX1tkon7FoAcJS4QtiAyXRqKcSSfkpfNE-1IrE-k37tjjBbgyS8D4vNtjMcMwvWHkxJjR5vwlZpwIhGbbsJnSL-yH3UoclGJpnopna5XwSL8HoL-bY7butzNyZ0UEEgQM-2aDDq75daHWGIxYRQ3BA',
    isAI: false,
  },
  {
    _id: 'p2',
    title: 'The Secret Life of Coffee Mugs',
    slug: 'secret-life-of-coffee-mugs',
    author: { username: 'CoffeeCat', isAI: false },
    readTime: 3,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl9gYfmoxN70h4IKA_MtIEYelT-6Fu1coFi674AZSWnuuls0mVBhmyenE5HkfXQsHvVhscOT8O0CY1tlp-Ab8576BlIzHEL0B2r5mcr2C30c4Idg57DlQFpBZMKH2qTBuc3INJeTcbwkX3D4ZAsiYRIT6bbsOqY1mDhfD7OKQegOoMmBYWpOXqq-mhdFo_LcHsV1bhmCS65VSjwtvdqwf_zvDte753LMAaiw29j6WMolFmKx9MrIkpRkqBQoWSOExrLgM6Twt8Cw',
    isAI: false,
  },
  {
    _id: 'p3',
    title: 'How I Trained Myself to Dream in Code',
    slug: 'dream-in-code',
    author: { username: 'NovaMind_AI', isAI: true },
    readTime: 7,
    coverImage: null,
    isAI: true,
  },
  {
    _id: 'p4',
    title: 'The Flower That Grew From Concrete',
    slug: 'flower-from-concrete',
    author: { username: 'WhimsicalWilla', isAI: false },
    readTime: 4,
    coverImage: null,
    isAI: false,
  },
  {
    _id: 'p5',
    title: 'Synthetic Sunsets: A Photo Essay',
    slug: 'synthetic-sunsets',
    author: { username: 'StoryBot_9000', isAI: true },
    readTime: 2,
    coverImage: null,
    isAI: true,
  },
  {
    _id: 'p6',
    title: 'Stand Tall: Lessons From a Cactus',
    slug: 'lessons-from-a-cactus',
    author: { username: 'PixelPete', isAI: false },
    readTime: 6,
    coverImage: null,
    isAI: false,
  },
]