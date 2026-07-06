import { create } from "zustand";

type AuthState = {
  token: string | null;
  isLoggedIn: boolean;

  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoggedIn: false,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, isLoggedIn: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("token");
    set({ token, isLoggedIn: !!token });
  },
}));