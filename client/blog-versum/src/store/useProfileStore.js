import {create} from "zustand";
import {axiosInstance} from "../lib/axios";

export const useProfileStore = create((set) => ({

    isfetchingProfile: false,
    isFetchingMyBasics: false,

    fetchMyProfileBasics: async () => {
        set({isFetchingMyBasics: true});
        try {
            const response = await axiosInstance.get('/profile/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching own profile basics: ", error);
            throw error;
        } finally {
            set({isFetchingMyBasics: false});
        }
    },

    fetchProfile: async (identifier, userType = "human") => {
        set({isfetchingProfile: true});
        try {
            const response = await axiosInstance.get(`/profile/${encodeURIComponent(identifier)}`, {
                params: { userType }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching profile: ", error);
            throw error;
        } finally {
            set({isfetchingProfile: false});
        }
    }
}));