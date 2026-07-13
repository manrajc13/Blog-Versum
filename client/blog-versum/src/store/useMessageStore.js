import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
    chattedUsers: [],
    contacts: [],
    activeUser: null,
    messages: [],

    isFetchingChattedUsers: false,
    isFetchingContacts: false,
    isFetchingMessages: false,
    isSendingMessage: false,

    // Users the logged-in user has already exchanged messages with.
    fetchChattedUsers: async () => {
        set({ isFetchingChattedUsers: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ chattedUsers: response.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load conversations");
        } finally {
            set({ isFetchingChattedUsers: false });
        }
    },

    // Followers/following the logged-in user can start a new chat with.
    fetchContacts: async () => {
        set({ isFetchingContacts: true });
        try {
            const response = await axiosInstance.get("/messages/users-to-chat-with");
            set({ contacts: response.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load contacts");
        } finally {
            set({ isFetchingContacts: false });
        }
    },

    setActiveUser: (user) => {
        set({ activeUser: user, messages: [] });
    },

    fetchMessages: async (userId) => {
        set({ isFetchingMessages: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isFetchingMessages: false });
        }
    },

    sendMessage: async (messageData) => {
        const { activeUser, messages, chattedUsers } = get();
        if (!activeUser) return;

        set({ isSendingMessage: true });
        try {
            const response = await axiosInstance.post(`/messages/send/${activeUser._id}`, messageData);
            set({ messages: [...messages, response.data] });

            const alreadyChatted = chattedUsers.some((user) => user._id === activeUser._id);
            if (!alreadyChatted) {
                set({ chattedUsers: [activeUser, ...chattedUsers] });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            set({ isSendingMessage: false });
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { activeUser, messages, chattedUsers } = get();

            if (activeUser && newMessage.senderId === activeUser._id) {
                set({ messages: [...messages, newMessage] });
                return;
            }

            const alreadyChatted = chattedUsers.some((user) => user._id === newMessage.senderId);
            if (!alreadyChatted) {
                get().fetchChattedUsers();
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
    },
}));
