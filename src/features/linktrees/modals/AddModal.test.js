import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render the form when show is true", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty title and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, { props: { show: true } });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAdd").mockImplementation(() => {});

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="add-linktree-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should submit trimmed values, then reset and close after success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAdd").mockImplementation(() => {});
    const listSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => {});

    await wrapper.find('[data-testid="add-linktree-title-input"]').setValue("  Judul  ");
    await wrapper.find('[data-testid="add-linktree-type-select"]').setValue("private");
    await wrapper.find('[data-testid="add-linktree-description-input"]').setValue("  Deskripsi  ");
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(addSpy).toHaveBeenCalledWith("Judul", "private", "Deskripsi");
    expect(wrapper.find('[data-testid="submit-add-modal-btn"]').text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeAdded(true);
    linkTreesStore.setIsLinkTreeAdd(true);
    await tick();

    expect(listSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="add-linktree-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="add-linktree-type-select"]').element.value).toBe("public");
  });

  it("should stop loading but stay open when the add fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });
    vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAdd").mockImplementation(() => {});

    await wrapper.find('[data-testid="add-linktree-title-input"]').setValue("Judul");
    await wrapper.find('[data-testid="add-linktree-description-input"]').setValue("Deskripsi");
    await wrapper.find("form").trigger("submit");
    await tick();

    linkTreesStore.setIsLinkTreeAdded(false);
    linkTreesStore.setIsLinkTreeAdd(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-add-modal-btn"]').text()).toContain("Tambah Link Tree");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, {
      props: { ...{ show: true }, onClose },
    });

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-add-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
