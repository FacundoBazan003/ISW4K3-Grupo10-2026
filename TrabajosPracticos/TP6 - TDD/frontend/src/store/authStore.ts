import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/mocks/users.mocks";

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    email: string | null;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            email: null,

            login: (user: User) => set({ user, email: user.email, isAuthenticated: true }),
            logout: () => set({ user: null, email: null, isAuthenticated: false }),
        }),
        {
            name: "auth",
        },
    ),
);
