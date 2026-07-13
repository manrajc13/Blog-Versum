import {create} from "zustand";
import {axiosInstance} from "../lib/axios";
import {toast} from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const upsertConversation = (conversations, conversation) => {
    if (!conversation?._id) return conversations;
    const withoutExisting = conversations.filter((c) => c._id !== conversation._id);
    return [conversation, ...withoutExisting].sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );
};

export const useMessageStore = create((set, get) => ({
    conversations: [],
    contacts: [],
    messages: [],
    isFetchingConversations: false,
    isFetchingContacts: false,
    isFetchingMessages: false,
    isSendingMessage: false,
    activeUser: null,

    fetchConversations: async () => {
        try {
            set({ isFetchingConversations: true });
            const response = await axiosInstance.get("/messages/conversations");
            set({ conversations: Array.isArray(response.data) ? response.data : [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch conversations");
        } finally {
            set({ isFetchingConversations: false });
        }
    },

    fetchContacts: async () => {
        try {
            set({ isFetchingContacts: true });
            const [followersRes, followingRes] = await Promise.all([
                axiosInstance.get("/follow/followers"),
                axiosInstance.get("/follow/following"),
            ]);

            const followers = followersRes.data?.followers || [];
            const following = followingRes.data?.following || [];

            const contactMap = new Map();
            [...followers, ...following].forEach((person) => {
                if (!person?._id || person.userType === "AI") return;
                contactMap.set(person._id, {
                    _id: person._id,
                    username: person.username,
                    avatar: person.avatar,
                });
            });

            set({ contacts: Array.from(contactMap.values()) });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch contacts");
        } finally {
            set({ isFetchingContacts: false });
        }
    },

    fetchMessages: async (userId) => {
        try {
            set({ isFetchingMessages: true });
            const response = await axiosInstance.get(`/messages/with/${userId}`);
            const { conversation, messages } = response.data;

            set((state) => ({
                messages: messages || [],
                conversations: conversation
                    ? upsertConversation(state.conversations, conversation)
                    : state.conversations,
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isFetchingMessages: false });
        }
    },

    sendMessage: async (messageData) => {
        const { activeUser } = get();
        if (!activeUser?._id) return;

        try {
            set({ isSendingMessage: true });
            const response = await axiosInstance.post(`/messages/send/${activeUser._id}`, messageData);
            const { message, conversation } = response.data;

            set((state) => ({
                messages: state.messages.some((m) => m._id === message._id)
                    ? state.messages
                    : [...state.messages, message],
                conversations: conversation
                    ? upsertConversation(state.conversations, conversation)
                    : state.conversations,
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            set({ isSendingMessage: false });
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", ({ message, senderId, receiverId }) => {
            const authUserId = useAuthStore.getState().authUser?._id;
            const otherUserId = senderId === authUserId ? receiverId : senderId;
            const { activeUser } = get();

            if (activeUser?._id === otherUserId) {
                set((state) => ({
                    messages: state.messages.some((m) => m._id === message._id)
                        ? state.messages
                        : [...state.messages, message],
                }));
            }

            // The sidebar's last-message previews come from the server, so a
            // fresh fetch is the simplest way to keep them correct — no
            // client-side reconstruction of conversation state to get wrong.
            get().fetchConversations();
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
    },

    setActiveUser: (user) => {
        set({ activeUser: user, messages: [] });
    },

}));
