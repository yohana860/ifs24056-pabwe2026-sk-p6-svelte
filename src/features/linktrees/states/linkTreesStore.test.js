import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLinkTreesStore, linkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  let successSpy;
  let errorSpy;

  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
    successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should have correct default state", () => {
    const store = useLinkTreesStore();
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    [
      "isLinkTree",
      "isLinkTreeAdd",
      "isLinkTreeAdded",
      "isLinkTreeChange",
      "isLinkTreeChanged",
      "isLinkTreeChangeCover",
      "isLinkTreeChangedCover",
      "isLinkTreeDelete",
      "isLinkTreeDeleted",
      "isLinkTreeDeleteAll",
      "isLinkTreeDeletedAll",
      "isLinkTreeItem",
      "isLinkTreeItemDone",
    ].forEach((key) => {
      expect(store[key]).toBe(false);
      expect(store.$state[key]).toBe(false);
    });
  });

  it("should update state with setters and reset with custom state", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    expect(store.linkTrees).toEqual([{ id: 1 }]);
    store.setLinkTree({ id: 2 });
    expect(store.linkTree).toEqual({ id: 2 });

    const setters = [
      ["setIsLinkTree", "isLinkTree"],
      ["setIsLinkTreeAdd", "isLinkTreeAdd"],
      ["setIsLinkTreeAdded", "isLinkTreeAdded"],
      ["setIsLinkTreeChange", "isLinkTreeChange"],
      ["setIsLinkTreeChanged", "isLinkTreeChanged"],
      ["setIsLinkTreeChangeCover", "isLinkTreeChangeCover"],
      ["setIsLinkTreeChangedCover", "isLinkTreeChangedCover"],
      ["setIsLinkTreeDelete", "isLinkTreeDelete"],
      ["setIsLinkTreeDeleted", "isLinkTreeDeleted"],
      ["setIsLinkTreeDeleteAll", "isLinkTreeDeleteAll"],
      ["setIsLinkTreeDeletedAll", "isLinkTreeDeletedAll"],
      ["setIsLinkTreeItem", "isLinkTreeItem"],
      ["setIsLinkTreeItemDone", "isLinkTreeItemDone"],
    ];
    setters.forEach(([setter, key]) => {
      store[setter](true);
      expect(store[key]).toBe(true);
    });

    store.reset({ linkTrees: [{ id: 9 }] });
    expect(store.linkTrees).toEqual([{ id: 9 }]);
    expect(store.isLinkTree).toBe(false);
  });

  describe("asyncSetLinkTrees", () => {
    it("should set link trees on success", async () => {
      vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);
      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should set empty array on failure", async () => {
      linkTreesStore.setLinkTrees([{ id: 1 }]);
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("x"));
      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set link tree and flag isLinkTree", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1 });
      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toEqual({ id: 1 });
      expect(linkTreesStore.isLinkTree).toBe(true);
    });

    it("should set null on failure but still flag isLinkTree", async () => {
      linkTreesStore.setLinkTree({ id: 1 });
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("x"));
      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toBeNull();
      expect(linkTreesStore.isLinkTree).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeAdd", () => {
    it("should flag success and show dialog", async () => {
      vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({});
      await linkTreesStore.asyncSetIsLinkTreeAdd("T", "public", "D");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(linkTreesStore.isLinkTreeAdded).toBe(true);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });

    it("should flag failure and show error", async () => {
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeAdd("T", "public", "D");
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeAdded).toBe(false);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChange", () => {
    it("should flag success with server message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Diubah");
      await linkTreesStore.asyncSetIsLinkTreeChange(1, "T", "public", "D");
      expect(successSpy).toHaveBeenCalledWith("Diubah");
      expect(linkTreesStore.isLinkTreeChanged).toBe(true);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });

    it("should use fallback success message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeChange(1, "T", "public", "D");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
    });

    it("should flag failure", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeChange(1, "T", "public", "D");
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeChanged).toBe(false);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChangeCover", () => {
    it("should flag success with server message", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Sampul diubah");
      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new File(["x"], "c.png"));
      expect(successSpy).toHaveBeenCalledWith("Sampul diubah");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });

    it("should use fallback success message", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new File(["x"], "c.png"));
      expect(successSpy).toHaveBeenCalledWith("Sampul berhasil diperbarui!");
    });

    it("should flag failure", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new File(["x"], "c.png"));
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDelete", () => {
    it("should flag success with server message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Dihapus");
      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Dihapus");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(true);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });

    it("should use fallback success message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
    });

    it("should flag failure", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDeleteAll", () => {
    it("should flag success with server message", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("Semua dihapus");
      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua dihapus");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });

    it("should use fallback success message", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
    });

    it("should flag failure", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });
  });

  describe("item mutations", () => {
    it("add item should call API and flag success", async () => {
      const spy = vi.spyOn(linkTreeApi, "postItem").mockResolvedValue("Ditambah");
      await linkTreesStore.asyncSetIsLinkTreeItemAdd(1, "T", "https://a.com");
      expect(spy).toHaveBeenCalledWith(1, "T", "https://a.com");
      expect(successSpy).toHaveBeenCalledWith("Ditambah");
      expect(linkTreesStore.isLinkTreeItemDone).toBe(true);
      expect(linkTreesStore.isLinkTreeItem).toBe(true);
    });

    it("add item should use fallback success message", async () => {
      vi.spyOn(linkTreeApi, "postItem").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeItemAdd(1, "T", "https://a.com");
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil ditambahkan!");
    });

    it("change item should call API and use fallback message", async () => {
      const spy = vi.spyOn(linkTreeApi, "putItem").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeItemChange(1, 2, "T", "https://a.com");
      expect(spy).toHaveBeenCalledWith(1, 2, "T", "https://a.com");
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil diperbarui!");
    });

    it("delete item should call API and use fallback message", async () => {
      const spy = vi.spyOn(linkTreeApi, "deleteItem").mockResolvedValue("");
      await linkTreesStore.asyncSetIsLinkTreeItemDelete(1, 2);
      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil dihapus!");
    });

    it("should flag failure when the API rejects", async () => {
      vi.spyOn(linkTreeApi, "deleteItem").mockRejectedValue(new Error("Gagal"));
      await linkTreesStore.asyncSetIsLinkTreeItemDelete(1, 2);
      expect(errorSpy).toHaveBeenCalledWith("Gagal");
      expect(linkTreesStore.isLinkTreeItemDone).toBe(false);
      expect(linkTreesStore.isLinkTreeItem).toBe(true);
    });
  });
});
