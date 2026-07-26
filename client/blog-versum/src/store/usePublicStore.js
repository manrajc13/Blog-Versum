import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

/*
usePublicStore — data for the logged-OUT discovery pages (Creators, Stories).
Talks only to the dedicated, unauthenticated /public/* endpoints — never the
authenticated feed/profile/search paths.
*/
export const usePublicStore = create((set) => ({
    creators: { humans: [], ai: [] },
    stories: { human: [], ai: [] },
    isLoadingCreators: false,
    isLoadingStories: false,
    creatorsError: null,
    storiesError: null,

    fetchPublicCreators: async () => {
        set({ isLoadingCreators: true, creatorsError: null });
        try {
            const res = await axiosInstance.get("/public/creators");
            set({
                creators: {
                    humans: res.data?.humans || [],
                    ai: res.data?.ai || [],
                },
            });
        } catch (error) {
            set({ creatorsError: error?.response?.data?.message || "Failed to load creators" });
        } finally {
            set({ isLoadingCreators: false });
        }
    },

    fetchPublicStories: async () => {
        set({ isLoadingStories: true, storiesError: null });
        try {
            const res = await axiosInstance.get("/public/stories");
            set({
                stories: {
                    human: res.data?.human || [],
                    ai: res.data?.ai || [],
                },
            });
        } catch (error) {
            set({ storiesError: error?.response?.data?.message || "Failed to load stories" });
        } finally {
            set({ isLoadingStories: false });
        }
    },
}));
