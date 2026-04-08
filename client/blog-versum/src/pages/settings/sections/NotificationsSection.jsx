import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { hexToRgba } from '../../../store/themeConfig'
import { useFollowStore } from '../../../store/useFollowStore'
import { DEFAULT_AVATAR_URL } from '../../../lib/defaultAvatar'

const formatRequestDate = (dateValue) => {
  if (!dateValue) return 'Requested recently'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Requested recently'
  return `Requested ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function NotificationsSection({ theme, authUser }) {
  const navigate = useNavigate()
  const {
    fetchPendingRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    fetchingPendingRequests,
    acceptingFollowRequest,
    rejectingFollowRequest,
  } = useFollowStore()

  const [requests, setRequests] = useState([])
  const [isBootLoading, setIsBootLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadPendingRequests = async () => {
      if (!authUser?.isPrivate) {
        if (mounted) {
          setRequests([])
          setIsBootLoading(false)
        }
        return
      }

      if (mounted) {
        setIsBootLoading(true)
      }

      try {
        const payload = await fetchPendingRequests()
        if (!mounted) return
        setRequests(payload?.requests || [])
      } catch {
        if (mounted) setRequests([])
      } finally {
        if (mounted) setIsBootLoading(false)
      }
    }

    loadPendingRequests()

    return () => {
      mounted = false
    }
  }, [authUser?.isPrivate, fetchPendingRequests])

  const handleOpenProfile = (username) => {
    if (!username) return
    navigate(`/profile/${encodeURIComponent(username)}`)
  }

  const handleAccept = async (requesterId) => {
    try {
      const response = await acceptFollowRequest({ userId: requesterId })
      setRequests((prev) => prev.filter((item) => item._id !== requesterId))
      toast.success(response?.message || 'Follow request accepted')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to accept request')
    }
  }

  const handleReject = async (requesterId) => {
    try {
      const response = await rejectFollowRequest({ userId: requesterId })
      setRequests((prev) => prev.filter((item) => item._id !== requesterId))
      toast.success(response?.message || 'Follow request rejected')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject request')
    }
  }

  const isActionLoading = acceptingFollowRequest || rejectingFollowRequest
  const showLoading = isBootLoading || fetchingPendingRequests

  const titleText = useMemo(() => {
    if (!authUser?.isPrivate) return 'Notifications'
    return `Follow Requests (${requests.length})`
  }, [authUser?.isPrivate, requests.length])

  return (
    <div className="space-y-6 relative">
      <div className="mb-6">
        <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#6c1d45' }}>
          {titleText}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {authUser?.isPrivate
            ? 'Review pending follow requests for your private account.'
            : 'Your account is public, so follow requests are accepted automatically.'}
        </p>
      </div>

      {!authUser?.isPrivate && (
        <div
          className="rounded-2xl border-2 border-dashed p-8 bg-white/80"
          style={{ borderColor: hexToRgba(theme.primary, 0.3) }}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl" style={{ color: theme.primary }}>
              lock_open
            </span>
            <p className="text-base font-bold text-slate-600">
              No pending-request notifications for public profiles.
            </p>
          </div>
        </div>
      )}

      {authUser?.isPrivate && (
        <div className="rounded-2xl border-2 bg-white/80 p-4" style={{ borderColor: hexToRgba(theme.primary, 0.2) }}>
          {showLoading && (
            <div className="py-10 flex items-center justify-center gap-3">
              <Loader className="size-6 animate-spin" style={{ color: theme.primary }} />
              <p className="text-sm font-bold text-slate-500">Loading requests...</p>
            </div>
          )}

          {!showLoading && requests.length === 0 && (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-4xl" style={{ color: hexToRgba(theme.primary, 0.4) }}>
                notifications_off
              </span>
              <p className="mt-2 text-sm font-bold text-slate-500">No pending follow requests right now.</p>
            </div>
          )}

          {!showLoading && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((request) => {
                return (
                  <div
                    key={request._id}
                    className="rounded-xl border-2 p-3 flex items-center gap-3"
                    style={{ borderColor: hexToRgba(theme.primary, 0.14), backgroundColor: hexToRgba(theme.primary, 0.04) }}
                  >
                    <button
                      onClick={() => handleOpenProfile(request.username)}
                      className="size-11 rounded-full overflow-hidden border-2 shrink-0 flex items-center justify-center text-white text-xs font-black"
                      style={{
                        borderColor: hexToRgba(theme.primary, 0.26),
                        backgroundColor: 'transparent',
                      }}
                    >
                      <img src={request.avatar || DEFAULT_AVATAR_URL} alt={request.username} className="w-full h-full object-cover" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => handleOpenProfile(request.username)}
                        className="text-left text-base font-extrabold text-slate-800 truncate hover:underline"
                      >
                        {request.username}
                      </button>
                      <p className="text-xs font-bold text-slate-400">{formatRequestDate(request.requestedAt)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-black border-2"
                        style={{
                          color: '#b91c1c',
                          borderColor: '#fca5a5',
                          backgroundColor: '#fef2f2',
                          opacity: isActionLoading ? 0.6 : 1,
                        }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAccept(request._id)}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-black text-white"
                        style={{
                          backgroundColor: theme.primary,
                          opacity: isActionLoading ? 0.6 : 1,
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
