import { writable } from "svelte/store";
import { putAccessToken, getAccessToken } from "../../../helpers/apiHelper";

// Baca token dari localStorage saat init
const initialState = {
  isAuthenticated: !!getAccessToken(),
  user: null,
};

function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setAuth: (user, token) => {
      if (token) putAccessToken(token);
      update((state) => ({ ...state, isAuthenticated: true, user }));
    },
    clearAuth: () => {
      putAccessToken(null);
      set({ isAuthenticated: false, user: null });
    },
    reset: () => set({ isAuthenticated: false, user: null }),
  };
}

export const authStore = createAuthStore();
export default authStore;