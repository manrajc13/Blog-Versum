import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import CoverImagePicker from '../components/CoverImagePicker'
import PageDoodles from '../components/shared/PageDoodles'
import { useThemeStore } from '../store/useThemeStore'
import { hexToRgba } from '../store/themeConfig'
import { usePostStore } from '../store/usePostStore'

// ─── Catchline extractor ──────────────────────────────────────────────────────
// Grabs the first 1-2 meaningful sentences from content, hard-capped at 160 chars
const extractCatchline = (content) => {
  const text = content.trim()
  if (!text) return ''

  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
  let catchline = ''

  for (const sentence of sentences) {
    const candidate = (catchline + ' ' + sentence).trim()
    if (candidate.length > 160) break
    catchline = candidate
    if ((catchline.match(/[.!?]/g) || []).length >= 2) break
  }

  if (catchline.length > 160) {
    catchline = catchline.slice(0, 160).replace(/\s+\S*$/, '') + '…'
  }

  return catchline.trim()
}

// ─── Font options ─────────────────────────────────────────────────────────────
const FONTS = [
  {
    id: 'serif',
    label: 'Classic Serif',
    style: 'Georgia, "Times New Roman", serif',
    sample: 'Aa',
    preview: 'Once upon a time…',
  },
  {
    id: 'sans',
    label: 'Clean Sans',
    style: '"Segoe UI", Helvetica, Arial, sans-serif',
    sample: 'Aa',
    preview: 'Once upon a time…',
  },
  {
    id: 'mono',
    label: 'Typewriter',
    style: '"Courier New", Courier, monospace',
    sample: 'Aa',
    preview: 'Once upon a time…',
  },
  {
    id: 'cursive',
    label: 'Handwritten',
    style: '"Comic Sans MS", "Chalkboard SE", cursive',
    sample: 'Aa',
    preview: 'Once upon a time…',
  },
]

// ─── Tag suggestions ──────────────────────────────────────────────────────────
const TAG_SUGGESTIONS = [
  '#Storytelling', '#Doodles', '#Fiction', '#Magic', '#ArtTips',
  '#DailyBlog', '#Poetry', '#Travel', '#Lifestyle', '#Tech',
  '#Personal', '#Adventure', '#Thoughts', '#Motivation',
]

// ─── Visibility options ───────────────────────────────────────────────────────
const VISIBILITY_OPTIONS = [
  {
    id: 'public',
    label: 'Public',
    desc: 'Visible to everyone on BlogVerse',
    icon: 'public',
  },
  {
    id: 'followers',
    label: 'Followers Only',
    desc: 'Only people who follow you can read this',
    icon: 'group',
  },
  {
    id: 'private',
    label: 'Private Draft',
    desc: 'Only you can see this — save for later',
    icon: 'lock',
  },
]

export default function CreatePost({ authUser }) {
  const navigate = useNavigate()
  const theme = useThemeStore((state) => state.getTheme())
  const fileInputRef = useRef(null)
  const { createPost } = usePostStore()

  // ── Form state ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    tags: [],
    readTime: '',
    visibility: 'public',
    fontId: 'serif',
  })

  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)

  useEffect(() => {
    const trimmed = form.content.trim()
    setCharCount(trimmed.length)
    setWordCount(trimmed === '' ? 0 : trimmed.split(/\s+/).length)
  }, [form.content])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // ── Cover image ──────────────────────────────────────────────────────────────
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result || ''
      update('coverImage', result)
      setCoverPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const removeCover = () => {
    update('coverImage', '')
    setCoverPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCoverSelect = (imageUrl) => {
    update('coverImage', imageUrl)
    setCoverPreview(imageUrl)
  }

  // ── Tags ─────────────────────────────────────────────────────────────────────
  const addTag = (tag) => {
    const normalized = tag.startsWith('#') ? tag : `#${tag}`
    if (form.tags.includes(normalized) || form.tags.length >= 6) return
    update('tags', [...form.tags, normalized])
    setTagInput('')
  }

  const removeTag = (tag) => update('tags', form.tags.filter((t) => t !== tag))

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput.trim().replace(/,/g, ''))
    }
    if (e.key === 'Backspace' && tagInput === '' && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  const filteredSuggestions = TAG_SUGGESTIONS.filter(
    (s) => !form.tags.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())
  )

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handlePublish = async (publishedFlag = true, visibilityOverride) => {
    if (!form.title.trim() || !form.content.trim()) return

    if (!form.coverImage) {
      toast.error('Please add a cover image before publishing')
      return
    }

    setIsSubmitting(true)

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      catchline: extractCatchline(form.content),
      coverImage: form.coverImage,
      tags: form.tags,
      readTime: form.readTime
        ? parseInt(form.readTime)
        : Math.max(1, Math.ceil(wordCount / 200)),
      visibility: visibilityOverride ?? form.visibility,
      published: publishedFlag,
      fontId: form.fontId,
    }

    try {
      await createPost(payload)
      navigate('/journal')
    } catch (err) {
      console.error('Failed to create post', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedFont = FONTS.find((f) => f.id === form.fontId) || FONTS[0]
  const titleIsEmpty = !form.title.trim()
  const contentIsEmpty = !form.content.trim()
  const coverIsEmpty = !form.coverImage

  return (
    <div
      className="text-slate-900 dark:text-slate-100 min-h-screen relative"
      style={{ backgroundColor: theme.homeBackground }}
    >
      {/* Centralized hand-drawn doodles */}
      <PageDoodles variant="sparse" />

      <div className="relative z-10 layout-container flex h-full grow flex-col">
        <Navbar
          iconColor={theme.primary}
          activeLink="My Journal"
          navLinks={[
            { label: 'Home', to: '/home' },
            { label: 'Explore', to: '#' },
            { label: 'My Journal', to: '/journal' },
            { label: 'Settings', to: '/settings' },
          ]}
          avatarUrl={authUser?.avatar}
        />

        {/* ── max-width increased from 860 → 1060px ── */}
        <main className="max-w-[1060px] mx-auto w-full px-5 md:px-8 py-10">

          {/* ── Top bar ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <button
              onClick={() => navigate('/journal')}
              className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full border-2 transition-all hover:shadow-sm"
              style={{
                color: theme.primary,
                borderColor: hexToRgba(theme.primary, 0.3),
                backgroundColor: hexToRgba(theme.primary, 0.06),
              }}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Journal
            </button>

            <h1 className="text-2xl font-black hidden md:block" style={{ color: '#6c1d45' }}>
              New Post
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePublish(false, 'private')}
                disabled={isSubmitting || titleIsEmpty || contentIsEmpty}
                className="font-extrabold text-sm px-5 py-2.5 rounded-full border-2 transition-all"
                style={{
                  color: hexToRgba(theme.primary, 0.8),
                  borderColor: hexToRgba(theme.primary, 0.3),
                  opacity: titleIsEmpty || contentIsEmpty ? 0.45 : 1,
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => handlePublish(true)}
                disabled={isSubmitting || titleIsEmpty || contentIsEmpty}
                className="font-extrabold text-sm px-6 py-2.5 rounded-full text-white transition-all active:translate-y-0.5"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.45)}`,
                  opacity: titleIsEmpty || contentIsEmpty ? 0.45 : 1,
                }}
              >
                {isSubmitting ? 'Publishing…' : 'Publish ✨'}
              </button>
            </div>
          </div>

          {/* ── Font Picker — ABOVE title, slim horizontal strip ─────────── */}
          <div
            className="rounded-2xl border-2 px-5 py-3.5 bg-white dark:bg-slate-900 mb-5 flex items-center gap-4 flex-wrap"
            style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
          >
            <span
              className="text-xs font-black uppercase tracking-widest shrink-0"
              style={{ color: hexToRgba(theme.primary, 0.6) }}
            >
              Font
            </span>

            {/* Font buttons — compact, horizontal */}
            <div className="flex gap-2 flex-wrap flex-1">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => update('fontId', font.id)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border-2 transition-all"
                  style={
                    form.fontId === font.id
                      ? {
                        borderColor: theme.primary,
                        backgroundColor: hexToRgba(theme.primary, 0.08),
                        boxShadow: `0 0 0 2px ${hexToRgba(theme.primary, 0.12)}`,
                      }
                      : { borderColor: hexToRgba(theme.primary, 0.12) }
                  }
                >
                  <span
                    className="text-lg font-bold leading-none"
                    style={{
                      fontFamily: font.style,
                      color: form.fontId === font.id ? theme.primary : '#94a3b8',
                    }}
                  >
                    {font.sample}
                  </span>
                  <span
                    className="text-xs font-black whitespace-nowrap"
                    style={{ color: form.fontId === font.id ? theme.primary : '#94a3b8' }}
                  >
                    {font.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Live preview sentence */}
            <span
              className="text-sm italic text-slate-400 shrink-0 hidden sm:block border-l pl-4"
              style={{
                fontFamily: selectedFont.style,
                borderColor: hexToRgba(theme.primary, 0.12),
              }}
            >
              {selectedFont.preview}
            </span>
          </div>

          {/* ── Cover Image ───────────────────────────────────────────────── */}
          <div className="mb-5">
            {coverPreview ? (
              <div
                className="relative rounded-2xl overflow-hidden h-56 md:h-72 border-2 group"
                style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
              >
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-slate-800 font-black text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">image</span>
                    Change
                  </button>
                  <button
                    onClick={() => setShowCoverPicker(true)}
                    className="bg-white text-slate-800 font-black text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">photo_library</span>
                    Library
                  </button>
                  <button
                    onClick={removeCover}
                    className="bg-red-500 text-white font-black text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl border-4 border-dashed p-6"
                style={{
                  borderColor: hexToRgba(theme.primary, 0.25),
                  backgroundColor: hexToRgba(theme.primary, 0.04),
                }}
              >
                <div className="flex flex-col items-center text-center mb-5">
                  <span
                    className="material-symbols-outlined text-4xl mb-2"
                    style={{ color: hexToRgba(theme.primary, 0.45) }}
                  >
                    add_photo_alternate
                  </span>
                  <p className="font-extrabold text-sm" style={{ color: hexToRgba(theme.primary, 0.7) }}>
                    Add a Cover Image
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: hexToRgba(theme.primary, 0.5) }}>
                    A cover image is required for your post
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: hexToRgba(theme.primary, 0.1),
                      color: theme.primary,
                      border: `2px solid ${hexToRgba(theme.primary, 0.2)}`,
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">upload</span>
                    Upload Your Image
                  </button>
                  <span className="text-xs font-bold text-slate-400">or</span>
                  <button
                    onClick={() => setShowCoverPicker(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: theme.primary,
                      boxShadow: `0 4px 0 ${hexToRgba(theme.primary, 0.4)}`,
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Pick from Our Library
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          {/* Cover Image Picker Modal */}
          <CoverImagePicker
            isOpen={showCoverPicker}
            onClose={() => setShowCoverPicker(false)}
            onSelect={handleCoverSelect}
            theme={theme}
          />

          {/* ── Writing card: Title + Content (font applied live) ────────── */}
          <div
            className="rounded-3xl border-2 bg-white dark:bg-slate-900 overflow-hidden shadow-sm mb-5"
            style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
          >
            {/* Title */}
            <div className="px-8 pt-8 pb-4 border-b-2" style={{ borderColor: hexToRgba(theme.primary, 0.08) }}>
              <textarea
                rows={2}
                placeholder="Your post title…"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                maxLength={150}
                className="w-full resize-none outline-none text-3xl md:text-4xl font-black leading-snug text-slate-800 dark:text-white placeholder-slate-300 bg-transparent"
                style={{ fontFamily: selectedFont.style }}
              />
              <p className="text-xs font-bold text-slate-300 text-right mt-1">{form.title.length}/150</p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <textarea
                rows={20}
                placeholder="Start writing your story here… let the words flow. ✍️"
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                className="w-full resize-none outline-none text-base leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-300 bg-transparent"
                style={{ fontFamily: selectedFont.style }}
              />
              <div
                className="flex items-center justify-between text-xs font-bold text-slate-300 mt-2 pt-3 border-t"
                style={{ borderColor: hexToRgba(theme.primary, 0.08) }}
              >
                <span>{wordCount} words · {charCount} characters</span>
                <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
              </div>
            </div>
          </div>

          {/* ── Settings panel ───────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Tags */}
            <div
              className="rounded-2xl border-2 p-6 bg-white dark:bg-slate-900"
              style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: hexToRgba(theme.primary, 0.7) }}>
                  Tags
                </h3>
                <span className="text-xs font-bold text-slate-400">{form.tags.length}/6</span>
              </div>

              <div
                className="flex flex-wrap gap-2 items-center p-3 rounded-xl border-2 transition-all mb-3"
                style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
              >
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black border"
                    style={{
                      color: theme.primary,
                      borderColor: hexToRgba(theme.primary, 0.3),
                      backgroundColor: hexToRgba(theme.primary, 0.08),
                    }}
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:opacity-60 transition-opacity ml-0.5">
                      <span className="material-symbols-outlined text-sm leading-none">close</span>
                    </button>
                  </span>
                ))}
                {form.tags.length < 6 && (
                  <input
                    type="text"
                    placeholder={form.tags.length === 0 ? 'Add a tag (e.g. Fiction)' : 'More tags…'}
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true) }}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 120)}
                    className="outline-none text-sm font-bold text-slate-700 placeholder-slate-300 bg-transparent min-w-[120px] flex-1"
                  />
                )}
              </div>

              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-black text-slate-400 w-full mb-1">Quick add:</span>
                  {filteredSuggestions.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onMouseDown={() => addTag(tag)}
                      className="px-3 py-1 rounded-full text-xs font-black border-2 transition-all hover:shadow-sm"
                      style={{
                        color: hexToRgba(theme.primary, 0.75),
                        borderColor: hexToRgba(theme.primary, 0.2),
                        backgroundColor: hexToRgba(theme.primary, 0.04),
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Read Time + Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Read Time */}
              <div
                className="rounded-2xl border-2 p-6 bg-white dark:bg-slate-900"
                style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
              >
                <h3 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: hexToRgba(theme.primary, 0.7) }}>
                  Read Time
                </h3>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl"
                    style={{ color: hexToRgba(theme.primary, 0.5) }}
                  >
                    schedule
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder={`Auto (~${Math.max(1, Math.ceil(wordCount / 200))} min)`}
                    value={form.readTime}
                    onChange={(e) => update('readTime', e.target.value)}
                    className="w-full pl-12 pr-16 py-3.5 rounded-xl border-2 outline-none font-bold text-slate-700 dark:text-slate-200 bg-transparent"
                    style={{ borderColor: hexToRgba(theme.primary, 0.2) }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">min</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-2">Leave blank to auto-calculate.</p>
              </div>

              {/* Visibility */}
              <div
                className="rounded-2xl border-2 p-6 bg-white dark:bg-slate-900"
                style={{ borderColor: hexToRgba(theme.primary, 0.15) }}
              >
                <h3 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: hexToRgba(theme.primary, 0.7) }}>
                  Visibility
                </h3>
                <div className="space-y-2">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                      style={
                        form.visibility === opt.id
                          ? { borderColor: theme.primary, backgroundColor: hexToRgba(theme.primary, 0.07) }
                          : { borderColor: hexToRgba(theme.primary, 0.1) }
                      }
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={opt.id}
                        checked={form.visibility === opt.id}
                        onChange={() => update('visibility', opt.id)}
                        className="hidden"
                      />
                      <span
                        className="material-symbols-outlined text-xl shrink-0"
                        style={{ color: form.visibility === opt.id ? theme.primary : '#94a3b8' }}
                      >
                        {opt.icon}
                      </span>
                      <div>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: form.visibility === opt.id ? theme.primary : '#475569' }}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs font-medium text-slate-400">{opt.desc}</p>
                      </div>
                      {form.visibility === opt.id && (
                        <span className="ml-auto material-symbols-outlined text-lg shrink-0" style={{ color: theme.primary }}>
                          check_circle
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom publish bar ───────────────────────────────────────── */}
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-5 border-2"
            style={{
              backgroundColor: hexToRgba(theme.primary, 0.05),
              borderColor: hexToRgba(theme.primary, 0.15),
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-full border-2 overflow-hidden bg-slate-200 shrink-0"
                style={{
                  backgroundImage: authUser?.avatar ? `url(${authUser.avatar})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderColor: hexToRgba(theme.primary, 0.3),
                }}
              />
              <div>
                <p className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                  {authUser?.username || 'You'}
                </p>
                <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 flex-wrap">
                  <span>{VISIBILITY_OPTIONS.find((v) => v.id === form.visibility)?.label}</span>
                  <span className="opacity-40">·</span>
                  <span>{form.readTime || Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                  <span className="opacity-40">·</span>
                  <span style={{ fontFamily: selectedFont.style }}>{selectedFont.label}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePublish(false, 'private')}
                disabled={isSubmitting || titleIsEmpty || contentIsEmpty}
                className="font-extrabold text-sm px-6 py-3 rounded-full border-2 transition-all"
                style={{
                  color: hexToRgba(theme.primary, 0.85),
                  borderColor: hexToRgba(theme.primary, 0.3),
                  opacity: titleIsEmpty || contentIsEmpty ? 0.4 : 1,
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => handlePublish(true)}
                disabled={isSubmitting || titleIsEmpty || contentIsEmpty}
                className="font-extrabold text-sm px-8 py-3 rounded-full text-white flex items-center gap-2 transition-all active:translate-y-0.5"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 5px 0 ${hexToRgba(theme.primary, 0.4)}`,
                  opacity: titleIsEmpty || contentIsEmpty ? 0.4 : 1,
                }}
              >
                <span className="material-symbols-outlined text-lg">send</span>
                {isSubmitting ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>
          </div>

          {/* Validation hint */}
          {(titleIsEmpty || contentIsEmpty || coverIsEmpty) && (
            <p className="text-center text-xs font-bold text-slate-400 mt-3">
              {titleIsEmpty && contentIsEmpty && coverIsEmpty
                ? 'Add a title, content, and cover image to publish.'
                : titleIsEmpty && contentIsEmpty
                ? 'Add a title and some content to publish.'
                : titleIsEmpty && coverIsEmpty
                ? 'Add a title and cover image to publish.'
                : contentIsEmpty && coverIsEmpty
                ? 'Add some content and a cover image to publish.'
                : titleIsEmpty
                ? 'Your post needs a title.'
                : contentIsEmpty
                ? 'Your post needs some content.'
                : 'Your post needs a cover image.'}
            </p>
          )}

        </main>
      </div>
    </div>
  )
}