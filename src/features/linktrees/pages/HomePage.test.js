import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("HomePage (link trees)", () => {
  const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mine = {
    id: 1,
    user_id: 1,
    title: "Tautan Praktikum",
    description: "Kumpulan tautan kuliah",
    type: "public",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
  };
  const other = {
    id: 2,
    user_id: 2,
    title: "Tautan Rahasia",
    description: "Punya orang lain",
    type: "private",
    cover: null,
    created_at: "2024-02-27T02:34:26.000000Z",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());
  });

  it("should render nothing while the profile is not loaded", () => {
    const { wrapper } = renderWithProviders(HomePage, { preloadedState: { profile: null } });
    expect(wrapper.text()).not.toContain("Daftar Link Tree");
  });

  it("should load link trees on mount and render stats and rows", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine, other] },
    });
    await tick();

    expect(linkTreesStore.asyncSetLinkTrees).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("2");
    expect(wrapper.find('[data-testid="stat-mine"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-public"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="linktree-row-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-1"] img').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-2"] img').exists()).toBe(false);
  });

  it("should show a loading state while fetching and the empty state afterwards", async () => {
    let resolveFetch;
    linkTreesStore.asyncSetLinkTrees.mockImplementation(
      () => new Promise((resolve) => (resolveFetch = resolve))
    );
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [] },
    });
    await tick();
    expect(wrapper.text()).toContain("Memuat daftar link tree...");

    resolveFetch();
    await tick();
    expect(wrapper.text()).toContain("Belum ada link tree yang cocok.");
  });

  it("should filter by search query (title and description) and by ownership", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine, other] },
    });
    await tick();

    const search = wrapper.find('[data-testid="search-linktree-input"]');
    await search.setValue("praktikum");
    expect(wrapper.find('[data-testid="linktree-row-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-2"]').exists()).toBe(false);

    await search.setValue("orang lain");
    expect(wrapper.find('[data-testid="linktree-row-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="linktree-row-2"]').exists()).toBe(true);

    await search.setValue("");
    await wrapper.find('[data-testid="filter-mine-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="linktree-row-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-2"]').exists()).toBe(false);

    await wrapper.find('[data-testid="filter-all-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="linktree-row-2"]').exists()).toBe(true);
  });

  it("should only show delete buttons for own link trees and navigate to detail", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine, other] },
    });
    await tick();

    expect(wrapper.find('[data-testid="delete-linktree-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-linktree-2"]').exists()).toBe(false);

    await wrapper.find('[data-testid="view-linktree-1"]').trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should delete one link tree only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const { wrapper, linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine] },
    });
    const deleteSpy = vi.spyOn(store, "asyncSetIsLinkTreeDelete").mockImplementation(() => {});
    await tick();

    await wrapper.find('[data-testid="delete-linktree-1"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-linktree-1"]').trigger("click");
    await tick();
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should delete all link trees only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const { wrapper, linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine] },
    });
    const deleteAllSpy = vi
      .spyOn(store, "asyncSetIsLinkTreeDeleteAll")
      .mockImplementation(() => {});
    await tick();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should reload the list after a delete or delete-all succeeded", async () => {
    const { linkTreesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [mine] },
    });
    await tick();
    const before = linkTreesStore.asyncSetLinkTrees.mock.calls.length;

    store.setIsLinkTreeDeleted(true);
    await tick();
    expect(store.isLinkTreeDeleted).toBe(false);
    expect(linkTreesStore.asyncSetLinkTrees.mock.calls.length).toBe(before + 1);

    store.setIsLinkTreeDeletedAll(true);
    await tick();
    expect(store.isLinkTreeDeletedAll).toBe(false);
    expect(linkTreesStore.asyncSetLinkTrees.mock.calls.length).toBe(before + 2);
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, linkTrees: [] },
    });
    await tick();

    await wrapper.find('[data-testid="add-linktree-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
  });
});
