import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("ChangeModal", () => {
  const linkTree = { id: 5, title: "Judul Lama", type: "unlisted", description: "Deskripsi Lama" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false or linkTree is missing", () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false, linkTree } });
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");

    const { wrapper: w2 } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree: null },
    });
    expect(w2.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should prefill the form with the link tree values", () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, linkTree } });
    expect(wrapper.find('[data-testid="edit-linktree-title-input"]').element.value).toBe("Judul Lama");
    expect(wrapper.find('[data-testid="edit-linktree-type-select"]').element.value).toBe("unlisted");
    expect(wrapper.find('[data-testid="edit-linktree-description-input"]').element.value).toBe(
      "Deskripsi Lama"
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty title and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree },
    });
    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChange")
      .mockImplementation(() => {});

    await wrapper.find('[data-testid="edit-linktree-title-input"]').setValue("  ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="edit-linktree-title-input"]').setValue("Baru");
    await wrapper.find('[data-testid="edit-linktree-description-input"]').setValue("");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should submit and then refresh data and close after success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree, onClose: closeSpy },
    });
    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChange")
      .mockImplementation(() => {});
    const listSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => {});
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => {});

    await wrapper.find('[data-testid="edit-linktree-title-input"]').setValue("  Judul Baru ");
    await wrapper.find('[data-testid="edit-linktree-type-select"]').setValue("public");
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(changeSpy).toHaveBeenCalledWith(5, "Judul Baru", "public", "Deskripsi Lama");
    expect(wrapper.find('[data-testid="submit-edit-modal-btn"]').text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeChanged(true);
    linkTreesStore.setIsLinkTreeChange(true);
    await tick();

    expect(listSpy).toHaveBeenCalled();
    expect(detailSpy).toHaveBeenCalledWith(5);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should stop loading but stay open when the change fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTree, onClose: closeSpy },
    });
    vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockImplementation(() => {});

    await wrapper.find("form").trigger("submit");
    await tick();

    linkTreesStore.setIsLinkTreeChanged(false);
    linkTreesStore.setIsLinkTreeChange(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-edit-modal-btn"]').text()).toContain("Perbarui");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { ...{ show: true, linkTree }, onClose },
    });

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-edit-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should close safely when no onClose callback is provided", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, linkTree } });

    await wrapper.find('[data-testid="cancel-edit-modal-btn"]').trigger("click");

    expect(wrapper.find('[data-testid="cancel-edit-modal-btn"]').exists()).toBe(true);
  });
});
