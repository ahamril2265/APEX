import { create } from 'zustand';

const useAppStore = create((set) => ({
    profile: null,
    chatMessages: [],
    isLoading: false,

    setProfile: (profile) => set({ profile }),

    setChatMessages: (messages) => set({ chatMessages: messages }),

    addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
    })),

    clearChatMessages: () => set({ chatMessages: [] }),

    setIsLoading: (status) => set({ isLoading: status }),
}));

export default useAppStore;
