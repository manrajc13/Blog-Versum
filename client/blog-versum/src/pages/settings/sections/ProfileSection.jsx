import { Loader } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { hexToRgba } from '../../../store/themeConfig'
import { useAuthStore } from '../../../store/useAuthStore'
import { DEFAULT_AVATAR_URL } from '../../../lib/defaultAvatar'
import { createPortal } from 'react-dom'


export default function ProfileSection({ theme }) {
  const { gettingProfileInfo, getProfileInfo, updateProfileSection, isUpdatingProfileSection } = useAuthStore()
  const [form, setForm] = useState({ username: '', bio: '', avatar: '' })
  const [initialForm, setInitialForm] = useState({ username: '', bio: '', avatar: '' })

  useEffect(() => {
    const loadProfileInfo = async () => {
      const profileInfo = await getProfileInfo()

      if (!profileInfo || typeof profileInfo !== 'object') {
        return
      }

      const fetchedData = {
        username: profileInfo.username || profileInfo.userName || '',
        bio: profileInfo.bio || '',
        avatar: profileInfo.avatar || profileInfo.profilePic || '',
      }

      setForm(fetchedData)
      setInitialForm(fetchedData)
    }

    loadProfileInfo()
  }, [getProfileInfo])

  const activeAvatar = form.avatar || initialForm.avatar || DEFAULT_AVATAR_URL

  const changedPayload = useMemo(() => {
    const payload = {}

    if (form.username !== initialForm.username) {
      payload.username = form.username
    }

    if (form.bio !== initialForm.bio) {
      payload.bio = form.bio
    }

    if (form.avatar !== initialForm.avatar) {
      payload.avatar = form.avatar
    }

    return payload
  }, [form, initialForm])

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setForm((prev) => ({ ...prev, avatar: e.target?.result || '' }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveChanges = async () => {
    if (Object.keys(changedPayload).length === 0) {
      toast('No profile changes to save')
      return
    }

    const updateResult = await updateProfileSection(changedPayload)

    if (updateResult === true) {
      setInitialForm(form)
      toast.success('Profile updated successfully')
      return
    }

    toast.error(updateResult || 'Unable to update the profile. Try again later.')
  }

  return (
    <div className="space-y-8 relative">
      <div className="mb-6">
        <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#6c1d45' }}>Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">How the multiverse sees you!</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:max-w-[1080px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-4 flex flex-col items-center">
            <label className="text-sm font-black uppercase tracking-wider text-slate-400">Profile Picture</label>
            <div className="flex flex-col items-center gap-4 pl-1 lg:pl-2">
              <div
                className="size-40 rounded-full border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xl shrink-0"
                style={{
                  backgroundImage: `url('${activeAvatar}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <label
                className="w-fit px-5 py-3 rounded-full border-2 bg-white font-black cursor-pointer"
                style={{ borderColor: hexToRgba(theme.primary, 0.24), color: theme.primary }}
              >
                Upload / Change Picture
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="text-xs font-bold" style={{ color: hexToRgba(theme.primary, 0.78) }}>PNG, JPG or WEBP supported.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-slate-400">Display Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.primary }}>face</span>
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-4 focus:ring-0 font-bold text-slate-700 transition-all outline-none"
                  style={{ borderColor: hexToRgba(theme.primary, 0.18) }}
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-slate-400">Bio</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-4" style={{ color: theme.primary }}>edit</span>
                <textarea
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-4 focus:ring-0 font-bold text-slate-700 transition-all outline-none"
                  style={{ borderColor: hexToRgba(theme.primary, 0.18) }}
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveChanges}
                disabled={isUpdatingProfileSection || gettingProfileInfo}
                className="text-white text-xl font-black px-12 py-5 rounded-full border-b-8 border-white shadow-2xl hover:translate-y-1 hover:border-b-4 transition-all active:translate-y-2 active:border-b-0"
                style={{
                  backgroundColor: theme.primary,
                  opacity: isUpdatingProfileSection || gettingProfileInfo ? 0.75 : 1,
                }}
              >
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      </div>

      {gettingProfileInfo && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}
        >
          <Loader className="size-10 animate-spin" style={{ color: theme.primary }} />
        </div>,
        document.body
      )}

      {isUpdatingProfileSection && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.28)' }}
        >
          <div className="rounded-2xl px-8 py-6 bg-white shadow-xl border-2 border-slate-200 flex items-center gap-4">
            <Loader className="size-8 animate-spin" style={{ color: theme.primary }} />
            <p className="text-lg font-bold text-slate-800">Updating Profile...</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
