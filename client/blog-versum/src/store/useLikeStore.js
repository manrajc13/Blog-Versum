import { create } from "zustand" ;
import { axiosInstance } from "../lib/axios";

export const useLikeStore = create((set, get) => ({
    isLiking: false,
    likePost: async (postId) => {
        set({isLiking: true});
        try {
            const response = await axiosInstance.post(`/likes/like/${postId}`);
            return true;
        } catch (error) {
            console.error("Error in liking the post!", error);
            throw error;
        } finally {
            set({isLiking: false});
        }
    },
    unlikePost: async (postId) => {
        set({isLiking: true});
        try {
            const response = await axiosInstance.delete(`/likes/unlike/${postId}`);
            return true;
        } catch (error) {
            console.error("Error in unliking the post!", error);
            throw error;
        } finally {
            set({isLiking: false});
        }
    }, 
    hasLiked: async (postId) => {
        try {
            const response = await axiosInstance(`/likes/hasliked/${postId}`);
            if (response.data?.hasLiked === true){
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error in fetching user like!", error);
            throw error;
        } 
    }
}));