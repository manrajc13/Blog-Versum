import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useCommentStore = create((set, get) => ({
    isfetchingComments: false,
    isPostingComment: false,
    isDeletingComment: false,

    fetchCommentsByPost: async (postId) => {
        set({ isfetchingComments: true });
        try {
            const response = await axiosInstance.get(`/comments/post/${postId}`);

            // Handle both response formats: direct array or wrapped in comments property
            const comments = Array.isArray(response.data) ? response.data : (response.data.comments || []);
            return comments;
        } catch (error) {
            console.error("Error fetching comments: ", error);
            throw error;
        } finally {
            set({ isfetchingComments: false });
        }
    },

    postComment: async (data) => {
        set({ isPostingComment: true});
        try {
            // data can contain: { postId, content, parentCommentId (optional) }
            const response = await axiosInstance.post('/comments/create', data);
            return response.data.comment;
        } catch (error) {
            console.error("Error posting comment: ", error);
            throw error;
        } finally {
            set({ isPostingComment: false });
        }
    },

    deleteComment: async (commentId) => {
        set({ isDeletingComment: true});
        try {
            const response = await axiosInstance.delete(`/comments/delete/${commentId}`);
            return true;
        } catch(error) {
            console.error("Error in deleting the comment: ", error);
        } finally {
            set( {isDeletingComment: false} );
        }
    }
}));