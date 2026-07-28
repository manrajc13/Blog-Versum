import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import {toast} from "react-hot-toast";
import { useThemeStore } from "./useThemeStore";
import {io} from "socket.io-client";

// Socket.IO needs the ABSOLUTE backend origin. In the split deployment the frontend
// is on Vercel and the API is on EC2, so "/" (same-origin) would wrongly target
// Vercel, which has no socket server. Point at the EC2 API origin via VITE_SOCKET_URL
// (e.g. https://blogversum-api.duckdns.org); localhost in dev.
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : import.meta.env.VITE_SOCKET_URL;

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

  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
        const response = await axiosInstance.get("/auth/check");
        syncThemeFromUser(response.data);
        set({authUser: response.data});
        get().connectSocket();
      }catch (error) {
        set({authUser:null});
        // Not authenticated (no session, or an expired one) — never show a
        // theme chosen by a previous login on this browser.
        useThemeStore.getState().setTheme('plain');
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

    sendOTP: async (data) => {
        try{
            const response = await axiosInstance.post("/auth/send-otp", data);
            toast.success(response.data.message || "OTP sent successfully");
            return true;
        } catch (error) {
            toast.error(error.response.data.message || "Failed to send OTP");
            return false;
        } 
    },

    verifyOTP: async (data, options = {}) => {
        const { silent = false } = options;
        try{
            const response = await axiosInstance.post("/auth/verify-email", data);
            if (!silent) {
                toast.success(response.data.message || "Email verified successfully");
            }
            return true;
        } catch (error) {
            toast.error(error.response.data.message || "Failed to verify email");
            return false;
        }
    },

    // --- Password reset flow ---
    forgotPassword: async (data) => {
        try {
            const response = await axiosInstance.post("/auth/forgot-password", data);
            toast.success(response.data.message || "Reset code sent");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code");
            return false;
        }
    },

    verifyResetOTP: async (data) => {
        try {
            await axiosInstance.post("/auth/verify-reset-otp", data);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired OTP");
            return false;
        }
    },

    resetPassword: async (data) => {
        try {
            const response = await axiosInstance.post("/auth/reset-password", data);
            toast.success(response.data.message || "Password reset successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
            return false;
        }
    },

    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            // Theme is an authenticated-account preference — revert to the
            // default public look the moment the session ends.
            useThemeStore.getState().setTheme('plain');
            toast.success("Logged out successfully");
            get().disconnectSocket();
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
            get().connectSocket();
            if (!silent) {
                toast.success("Logged in successfully");
            }
            return true;
        } catch (error) {
            // If it's a 403 verification error, throw it so Login.jsx can handle verification flow
            if (error.response?.status === 403 && error.response?.data?.message?.includes("not verified")) {
                throw error;
            }
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
    },
    
    connectSocket: () => {
        const {authUser} = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({socket: socket});

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds});
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }

}));