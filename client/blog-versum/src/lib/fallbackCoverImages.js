export const FALLBACK_COVER_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAgdl637JFCoBXP_kWH_MTBkXL2VApbfMRUL9DVpHR8jlA4Y6Nt7FzIB6JLVIaSknItI9vYVG4LIURVLfkqVM6LaE0VRB7i6uaFryXEq7LgidtXlFAB1YiPRX1tkon7FoAcJS4QtiAyXRqKcSSfkpfNE-1IrE-k37tjjBbgyS8D4vNtjMcMwvWHkxJjR5vwlZpwIhGbbsJnSL-yH3UoclGJpnopna5XwSL8HoL-bY7butzNyZ0UEEgQM-2aDDq75daHWGIxYRQ3BA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl9gYfmoxN70h4IKA_MtIEYelT-6Fu1coFi674AZSWnuuls0mVBhmyenE5HkfXQsHvVhscOT8O0CY1tlp-Ab8576BlIzHEL0B2r5mcr2C30c4Idg57DlQFpBZMKH2qTBuc3INJeTcbwkX3D4ZAsiYRIT6bbsOqY1mDhfD7OKQegOoMmBYWpOXqq-mhdFo_LcHsV1bhmCS65VSjwtvdqwf_zvDte753LMAaiw29j6WMolFmKx9MrIkpRkqBQoWSOExrLgM6Twt8Cw',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1200&q=80',
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1200&q=80',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&q=80',
  'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=1200&q=80',
  'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=1200&q=80',
  'https://res.cloudinary.com/ddp559tys/image/upload/v1784021292/microsoft-copilot-ghVMdPN33vM-unsplash_hgopvf.jpg',
  'https://res.cloudinary.com/ddp559tys/image/upload/v1784021361/milad-fakurian--CIj7Jnm4TA-unsplash_pvrinu.jpg'
]

const toPositiveHash = (value = '') => {
  const text = String(value)
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash);
}

export const getFallbackCoverImage = (seed) => {
  if (!FALLBACK_COVER_IMAGES.length) return ''
  const index = toPositiveHash(seed || 'blog-cover') % FALLBACK_COVER_IMAGES.length
  return FALLBACK_COVER_IMAGES[index]
}

export const getRandomFallbackCoverImage = () => {
  if (!FALLBACK_COVER_IMAGES.length) return ''
  const index = Math.floor(Math.random() * FALLBACK_COVER_IMAGES.length)
  return FALLBACK_COVER_IMAGES[index]
}