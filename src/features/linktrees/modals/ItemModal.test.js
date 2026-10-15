import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("ItemModal", () => {
  const item = { id: 7, title: "GitHub", url: "https://github.com" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: false, linkTreeId: 1 } });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render empty form in add mode", () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: true, linkTreeId: 1 } });
    expect(wrapper.text()).toContain("Tambah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });

  it("should prefill form in edit mode", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item },
    });
    expect(wrapper.text()).toContain("Ubah Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("GitHub");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("https://github.com");
  });

  it("should validate empty title and url", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeItemAdd").mockImplementation(() => {});

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    await wrapper.find('[data-testid="item-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should add an item then refresh the detail and close", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeItemAdd").mockImplementation(() => {});
    const detailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => {});

    await wrapper.find('[data-testid="item-title-input"]').setValue(" Situs ");
    await wrapper.find('[data-testid="item-url-input"]').setValue(" https://a.com ");
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(addSpy).toHaveBeenCalledWith(1, "Situs", "https://a.com");
    expect(wrapper.find('[data-testid="submit-item-modal-btn"]').text()).toContain("Menyimpan...");

    linkTreesStore.setIsLinkTreeItemDone(true);
    linkTreesStore.setIsLinkTreeItem(true);
    await tick();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should change an existing item", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item },
    });
    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeItemChange")
      .mockImplementation(() => {});

    await wrapper.find("form").trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 7, "GitHub", "https://github.com");
  });

  it("should stop loading but stay open when the mutation fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item, onClose: closeSpy },
    });
    vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeItemChange").mockImplementation(() => {});

    await wrapper.find("form").trigger("submit");
    await tick();
    linkTreesStore.setIsLinkTreeItemDone(false);
    linkTreesStore.setIsLinkTreeItem(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-item-modal-btn"]').text()).toContain("Simpan Tautan");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { ...{ show: true, linkTreeId: 1 }, onClose },
    });

    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-item-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should close safely when no onClose callback is provided", async () => {
    const { wrapper } = renderWithProviders(ItemModal, { props: { show: true, linkTreeId: 1 } });

    await wrapper.find('[data-testid="cancel-item-modal-btn"]').trigger("click");

    expect(wrapper.find('[data-testid="cancel-item-modal-btn"]').exists()).toBe(true);
  });
});
