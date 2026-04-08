import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useExploreStore = create((set, get) => ({
    topics: [],
}));