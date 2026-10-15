import { writable } from "svelte/store";
import { putAccessToken, getAccessToken } from "../../../helpers/apiHelper";

// Init dari localStorage supaya tidak reset saat page reload
const initialState = {
  isAuthenticated: !!getAccessToken(),
  user: null,
};

function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setAuth: (user) =>
      update((state) => ({ ...state, isAuthenticated: true, user })),
    clearAuth: () => {
      putAccessToken(null);
      set({ isAuthenticated: false, user: null });
    },
    restore: () => {
      const token = getAccessToken();
      if (token) {
        update((state) => ({ ...state, isAuthenticated: true }));
      }
    },
    reset: () => set({ isAuthenticated: false, user: null }),
  };
}

export const authStore = createAuthStore();
export default authStore;