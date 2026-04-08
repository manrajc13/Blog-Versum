import {create} from "zustand";
import {axiosInstance} from "../lib/axios";

export const useFollowStore = create((set, get) => ({
    gettingFollowingorFollowed : false,
    fetchingPendingRequests: false,
    sendingFollowRequest: false,
    acceptingFollowRequest: false,
    rejectingFollowRequest: false,
    unfollowing: false,

    fetchPendingRequests: async () => {
        set({fetchingPendingRequests: true});
        try {
            const response = await axiosInstance.get('/follow/pending');
            return response.data;
        } catch (error) {
            console.error("Error fetching pending requests: ", error);
            throw error;
        } finally {
            set({fetchingPendingRequests: false});
        }
    },

    fetchFollowing: async () => {
        set({gettingFollowingorFollowed: true});
        try{
            const response = await axiosInstance.get('/follow/following');
            return response.data;
        } catch (error) {
            console.error("Error fetching following: ", error);
            throw error;
        } finally {
            set({gettingFollowingorFollowed: false});
        }
    },

    fetchFollowers: async () => {
        set({gettingFollowingorFollowed: true});
        try {
            const response = await axiosInstance.get('/follow/followers')
            return response.data;
        } catch (error){
            console.error("Error fetching followers: ", error);
            throw error;
        } finally {
            set({gettingFollowingorFollowed: false});
        }
    },

    sendFollowRequest: async (data) => {
        set({sendingFollowRequest: true});
        try {
            const response = await axiosInstance.post("/follow/request", data);
            return response.data;
        } catch (error) {
            console.error("Error sending follow request: ", error);
            throw error;
        } finally {
            set({sendingFollowRequest: false});
        }
    },

    acceptFollowRequest: async (data) => {
        set({acceptingFollowRequest: true});
        try {
            const response = await axiosInstance.post("/follow/accept", data);
            return response.data;
        } catch (error) {
            console.error("Error accepting follow request: ", error);
            throw error;
        } finally {
            set({acceptingFollowRequest: false});
        }
    },

    rejectFollowRequest: async (data) => {
        set({rejectingFollowRequest: true});
        try {
            const response = await axiosInstance.post("/follow/reject", data);
            return response.data;
        } catch (error) {
            console.error("Error rejecting follow request: ", error);
            throw error;
        } finally {
            set({rejectingFollowRequest: false});
        }   
    },

    unfollow: async (data) => {
        set({unfollowing: true});
        try {
            const response = await axiosInstance.post("/follow/unfollow", data);
            return response.data;
        } catch (error) {
            console.error("Error unfollowing user: ", error);
            throw error;
        } finally {
            set({unfollowing: false});
        }
    }

}));