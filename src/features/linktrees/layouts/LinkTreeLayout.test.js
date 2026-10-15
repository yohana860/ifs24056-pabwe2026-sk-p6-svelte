import { describe, it, expect, vi, beforeEach } from "vitest";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import * as routerModule from "../../../router";
import { usersStore } from "../../users/states/usersStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("LinkTreeLayout", () => {
  const profile = { id: 1, name: "Test User", email: "test@delcom.org" };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(LinkTreeLayout, { preloadedState: { profile: null } });

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(usersStore.asyncSetProfile).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should load profile when a token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(LinkTreeLayout, { preloadedState: { profile: null } });

    expect(usersStore.asyncSetProfile).toHaveBeenCalled();
  });

  it("should render navbar and sidebar, toggle the sidebar and logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Test User");

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);

    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(() => {});
    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");
    await tick();

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should stay on the page when isProfile is triggered and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, usersStore: store } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile },
    });
    navSpy.mockClear();

    store.setIsProfile(true);
    await tick();

    expect(navSpy).not.toHaveBeenCalled();
    expect(store.isProfile).toBe(false);
    expect(wrapper.text()).toContain("Test User");
  });

  it("should clear token and redirect to login when isProfile is triggered and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { usersStore: store } = renderWithProviders(LinkTreeLayout, {
      preloadedState: { profile: null },
    });

    store.setIsProfile(true);
    await tick();

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { authStore } = renderWithProviders(LinkTreeLayout, { preloadedState: { profile } });

    authStore.setIsAuthLogout(true);
    await tick();

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(authStore.isAuthLogout).toBe(false);
  });
});
