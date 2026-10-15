import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("DetailPage (link tree)", () => {
  const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const linkTree = {
    id: 1,
    user_id: 1,
    title: "Detail Link Tree",
    description: "Detail Deskripsi",
    type: "unlisted",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    items: [
      { id: 10, title: "GitHub", url: "https://github.com" },
      { id: 11, title: "GitLab", url: "https://gitlab.com" },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
  });

  it("should show a spinner when profile or link tree is missing", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: null, linkTree: null },
    });
    expect(wrapper.text()).not.toContain("Detail Link Tree");

    const { wrapper: w2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree: null },
    });
    expect(w2.text()).not.toContain("Detail Link Tree");
    expect(linkTreesStore.asyncSetLinkTree).toHaveBeenCalledWith(1);
  });

  it("should render details, items, and owner controls", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });

    expect(wrapper.text()).toContain("Detail Link Tree");
    expect(wrapper.text()).toContain("Detail Deskripsi");
    expect(wrapper.find('[data-testid="item-row-10"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="item-row-11"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-item-10"]').exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it("should hide owner controls for other users and handle empty items without cover", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: { id: 99, name: "Lain" },
        linkTree: { ...linkTree, cover: null, items: [] },
      },
    });

    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="add-item-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="items-empty"]').exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("should hide item controls for other users when items exist and tolerate missing items", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: { id: 99, name: "Lain" }, linkTree },
    });
    expect(wrapper.find('[data-testid="item-row-10"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-item-10"]').exists()).toBe(false);

    const { wrapper: w2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree: { ...linkTree, items: undefined } },
    });
    expect(w2.find('[data-testid="items-empty"]').exists()).toBe(true);
  });

  it("should navigate back and redirect home when the link tree could not be loaded", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });
    navSpy.mockClear();

    await wrapper.find('[data-testid="back-to-linktrees-link"]').trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/");

    navSpy.mockClear();
    store.setIsLinkTree(true);
    await tick();
    expect(navSpy).not.toHaveBeenCalled();
    expect(store.isLinkTree).toBe(false);

    store.setLinkTree(null);
    store.setIsLinkTree(true);
    await tick();
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should navigate home after the link tree is deleted", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });
    navSpy.mockClear();

    store.setIsLinkTreeDeleted(true);
    await tick();

    expect(navSpy).toHaveBeenCalledWith("/");
    expect(store.isLinkTreeDeleted).toBe(false);
  });

  it("should delete the link tree only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });
    const deleteSpy = vi.spyOn(store, "asyncSetIsLinkTreeDelete").mockImplementation(() => {});

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should open and close the cover and edit modals", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });

    await wrapper.find('[data-testid="edit-cover-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="edit-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should open the item modal for adding and editing", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });

    await wrapper.find('[data-testid="add-item-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="item-modal"]').text()).toContain("Tambah Tautan");
    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="edit-item-10"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="item-modal"]').text()).toContain("Ubah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("GitHub");
  });

  it("should delete an item only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const { wrapper, linkTreesStore: store } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });
    const deleteSpy = vi.spyOn(store, "asyncSetIsLinkTreeItemDelete").mockImplementation(() => {});

    await wrapper.find('[data-testid="delete-item-10"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-item-10"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(1, 10);
  });

  it("should reload when the linkTreeId prop changes", async () => {
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile, linkTree },
    });
    linkTreesStore.asyncSetLinkTree.mockClear();

    await rerender({ linkTreeId: 2 });
    await tick();

    expect(linkTreesStore.asyncSetLinkTree).toHaveBeenCalledWith(2);
  });
});
