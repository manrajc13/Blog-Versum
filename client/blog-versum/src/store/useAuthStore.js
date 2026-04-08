import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import {toast} from "react-hot-toast";
import { useThemeStore } from "./useThemeStore";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/" ;

const syncThemeFromUser = (user) => {
    const themePreference = user?.themePreference;

    if (!themePreference) {
        return;
    }

    useThemeStore.getState().setTheme(themePreference);
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isUpdatingProfileSection: false,
  isCheckingAuth: true,
  isUpdatingTheme: false,
  gettingProfileInfo: false,

  onlineUsers: [],

  checkAuth: async () => {
    try {
        const response = await axiosInstance.get("/auth/check");
        syncThemeFromUser(response.data);
        set({authUser: response.data});
      }catch (error) { 
        set({authUser:null});
        console.log(error);
      } finally {
        set({isCheckingAuth: false});
      }
    },

    getProfileInfo: async () => {
        try {
            set({gettingProfileInfo: true});
            let response;

            try {
                response = await axiosInstance.get("/auth/profile-info");
            } catch (error){
                console.error(error.response.data.message || "Failed to fetch profile info");
            }

            return response.data;
        } catch (error) {
            console.error(error.response.data.message || "Failed to fetch profile info");
            return null;
        } finally {
            set({gettingProfileInfo: false});
        }
    },

    signup: async (data) => {
        set({isSigningUp: true});
        try{
            const response = await axiosInstance.post("/auth/signup", data);
            const createdUser = response?.data;
            const hasAuthenticatedPayload = Boolean(createdUser?._id || createdUser?.username);

            if (hasAuthenticatedPayload) {
                syncThemeFromUser(createdUser);
                set({authUser: createdUser});
            } else {
                set({authUser: null});
            }

            toast.success(createdUser?.message || "Account created successfully");
            return true;
        } catch (error) {
            toast.error(error.response.data.message || "Failed to create account");
            return false;
        } finally {
            set({isSigningUp: false});
        }
    },

    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to logout");
        }
    },

    login: async (data, options = {}) => {
        const { silent = false } = options;
        set({isLoggingIn: true});
        try{
            const response = await axiosInstance.post("/auth/login", data);
            syncThemeFromUser(response.data);
            set({authUser: response.data});
            if (!silent) {
                toast.success("Logged in successfully");
            }
            return true;
        } catch (error) {
            toast.error(error.response.data.message || "Failed to login");
            return false;
        } finally {
            set({isLoggingIn: false});
        }
    },

    updateProfile: async (data, options = {}) => {
        const { silent = false } = options;
        set({isUpdatingProfile: true});
        try{
            const res = await axiosInstance.put("/auth/update-profile", data);
            const currentUser = get().authUser;

            if (data?.themePreference) {
                useThemeStore.getState().setTheme(data.themePreference);
            }

            const hasAuthPayload = Boolean(res?.data?._id || res?.data?.username || res?.data?.email);
            if (hasAuthPayload) {
                syncThemeFromUser(res.data);
                set({authUser: res.data});
            } else if (currentUser) {
                set({authUser: {...currentUser, ...data}});
            }

            if (!silent) {
                toast.success(res?.data?.message || "Profile updated successfully");
            }
            return true;
        } catch (error){
            toast.error(error.response.data.message || "Failed to update profile");
            return false;
        } finally {
            set({isUpdatingProfile: false});
        }
    },

    updateTheme: async (theme) => {
        set({isUpdatingTheme: true});
        try {
            const res = await axiosInstance.put("/auth/update-theme", { themePreference: theme });
            const currentUser = get().authUser;
            useThemeStore.getState().setTheme(theme);

            const hasAuthPayload = Boolean(res?.data?._id || res?.data?.username || res?.data?.email);
            if (hasAuthPayload) {
                syncThemeFromUser(res.data);
                set({authUser: res.data});
            } else if (currentUser) {
                set({authUser: {...currentUser, themePreference: theme}});
            }

            return true;
        } catch (error) {
            return false;
        } finally {
            set({isUpdatingTheme: false});
        }
    },

    updateProfileSection: async (data) => {
        set({isUpdatingProfileSection: true});
        try {
            const res = await axiosInstance.put("/auth/update-profile-section", data);
            const currentUser = get().authUser;

            if (res?.data && currentUser && typeof res.data === "object" && (res.data.username || res.data.avatar || res.data.bio || res.data.email)) {
                set({authUser: res.data});
            } else if (currentUser) {
                set({authUser: {...currentUser, ...data}});
            }

            return true;
        } catch (error) {
            return error?.response?.data?.message || "Unable to update the profile. Try again later.";
        } finally {
            set({isUpdatingProfileSection: false});
        }
    }
}));