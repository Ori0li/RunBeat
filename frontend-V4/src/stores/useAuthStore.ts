import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  accountId: number | null;
  role: "user" | "trainer" | null;
  hasHydrated: boolean;
  setAuth: (token: string, accountId: number, role: "user" | "trainer") => void;
  clearAuth: () => void;
  setHasHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      accountId: null,
      role: null,
      hasHydrated: false,
      setAuth: (token, accountId, role) =>
        set({ accessToken: token, accountId, role }),
      clearAuth: () => set({ accessToken: null, accountId: null, role: null }),
      setHasHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.();
      },
    },
  ),
);
