"use client";

import { create } from "zustand";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
};

type AppStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
};

export const useStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id }),
}));
