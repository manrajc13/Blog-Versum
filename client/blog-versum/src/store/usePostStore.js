import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import {toast} from "react-hot-toast";

export const usePostStore = create((set, get) => ({
  posts: [],
  isFetchingPosts: false,
  isCreatingPost: false,
  isDeletingPost: false,

  fetchMyPosts: async () => {
    set({ isFetchingPosts: true })
    try {
      const res = await axiosInstance.get('/posts/my-posts')
      set({ posts: res.data })
      return res.data
    } catch (err) {
      set({ posts: [] })
      toast.error(err?.response?.data?.message || 'Could not load posts')
      return []
    } finally {
      set({ isFetchingPosts: false })
    }
  },

  createPost: async (data) => {
    set({ isCreatingPost: true })
    try {
      const res = await axiosInstance.post('/posts/create', data)
      set((state) => ({ posts: [res.data, ...state.posts] }))
      toast.success('Post published!')
      return true
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish')
      return false
    } finally {
      set({ isCreatingPost: false })
    }
  },


  deletePost: async (postId) => {
    set({ isDeletingPost: true })
    try {
      await axiosInstance.delete(`/posts/delete/${postId}`)
      set((state) => ({ posts: state.posts.filter((p) => p._id !== postId && p.id !== postId) }))
      toast.success('Post deleted!')
      return true
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete post')
      return false
    } finally {
      set({ isDeletingPost: false })

    }
  },

  fetchPostById: async (postId) => {
    try {
      const res = await axiosInstance.get(`/posts/post/${postId}`)
      return res.data
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not load post')
      return null
    } 
  }
}))