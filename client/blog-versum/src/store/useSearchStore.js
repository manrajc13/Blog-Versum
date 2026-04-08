import {create} from "zustand";
import {axiosInstance} from "../lib/axios";

const EMPTY_RESULTS = { authors: [], posts: [] }

export const useSearchStore = create((set) => ({
	isSearching: false,
	results: EMPTY_RESULTS,

	clearSearchResults: () => {
		set({ results: EMPTY_RESULTS, isSearching: false })
	},

	fetchSearchResults: async ({ query, typeFilter = "All", originFilter = "All" }) => {
		const q = (query || "").trim()
		if (!q) {
			set({ results: EMPTY_RESULTS, isSearching: false })
			return EMPTY_RESULTS
		}

		const isBlog = typeFilter === "Authors"
			? "false"
			: typeFilter === "Blogs"
				? "true"
				: "all"

		const userType = originFilter === "All" ? "undefined" : originFilter

		set({ isSearching: true })
		try {
			const response = await axiosInstance.get(`/search/${encodeURIComponent(q)}/${isBlog}/${userType}`)

			const nextResults = {
				authors: (response.data.users || []).map((user) => ({
					...user,
					isAI: user.authorType === "AI",
				})),
				posts: (response.data.posts || []).map((post) => ({
					...post,
					isAI: post.authorType === "AI",
					author: { username: post.username },
				})),
			}

			set({ results: nextResults })
			return nextResults
		} catch (error) {
			set({ results: EMPTY_RESULTS })
			throw error
		} finally {
			set({ isSearching: false })
		}
	},
}));