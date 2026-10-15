import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResult(result) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => result,
  });
}

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("request handling", () => {
    it("should accept a response flagged with success=true and no status", async () => {
      mockResult({ success: true, message: "ok" });
      await expect(linkTreeApi.deleteAllLinkTrees()).resolves.toBe("ok");
    });

    it("should throw the server message on failure", async () => {
      mockResult({ status: "fail", message: "Data tidak valid" });
      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Data tidak valid");
    });
  });

  describe("postLinkTree", () => {
    it("should post JSON payload and return data", async () => {
      const spy = mockResult({ status: "success", data: { link_tree_id: 10 } });

      const res = await linkTreeApi.postLinkTree("Judul", "public", "Deskripsi");

      expect(res).toEqual({ link_tree_id: 10 });
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        title: "Judul",
        type: "public",
        description: "Deskripsi",
      });
    });

    it("should use fallback message when none is provided", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow(
        "Gagal menambahkan link tree"
      );
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData", async () => {
      const spy = mockResult({ status: "success", message: "Sampul diubah" });
      const file = new File(["dummy"], "cover.png", { type: "image/png" });

      const msg = await linkTreeApi.postLinkTreeCover(3, file);

      expect(msg).toBe("Sampul diubah");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/3/cover");
      expect(options.body.get("cover").name).toBe("cover.png");
    });

    it("should fall back to default file name for blobs without name", async () => {
      const spy = mockResult({ status: "success", message: "ok" });
      await linkTreeApi.postLinkTreeCover(3, new Blob(["x"], { type: "image/png" }));
      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      const file = new File(["dummy"], "cover.png", { type: "image/png" });
      await expect(linkTreeApi.postLinkTreeCover(3, file)).rejects.toThrow("Gagal mengubah sampul");
    });
  });

  describe("putLinkTree", () => {
    it("should send PUT with payload and return message", async () => {
      const spy = mockResult({ status: "success", message: "Diubah" });

      const msg = await linkTreeApi.putLinkTree(5, "T", "private", "D");

      expect(msg).toBe("Diubah");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/5");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ title: "T", type: "private", description: "D" });
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.putLinkTree(5, "T", "public", "D")).rejects.toThrow(
        "Gagal mengubah link tree"
      );
    });
  });

  describe("getLinkTrees", () => {
    it("should return link_trees array", async () => {
      mockResult({ status: "success", data: { link_trees: [{ id: 1 }] } });
      await expect(linkTreeApi.getLinkTrees()).resolves.toEqual([{ id: 1 }]);
    });

    it("should return an empty array when link_trees is missing", async () => {
      mockResult({ status: "success", data: {} });
      await expect(linkTreeApi.getLinkTrees()).resolves.toEqual([]);
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal mengambil data link tree");
    });
  });

  describe("getLinkTreeById", () => {
    it("should return link_tree with items", async () => {
      const spy = mockResult({
        status: "success",
        data: { link_tree: { id: 2, items: [{ id: 9 }] } },
      });

      const res = await linkTreeApi.getLinkTreeById(2);

      expect(res).toEqual({ id: 2, items: [{ id: 9 }] });
      expect(spy.mock.calls[0][0]).toContain("/link-trees/2");
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.getLinkTreeById(2)).rejects.toThrow("Gagal mengambil detail link tree");
    });
  });

  describe("deleteLinkTree", () => {
    it("should send DELETE and return message", async () => {
      const spy = mockResult({ status: "success", message: "Dihapus" });

      await expect(linkTreeApi.deleteLinkTree(4)).resolves.toBe("Dihapus");
      expect(spy.mock.calls[0][0]).toContain("/link-trees/4");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.deleteLinkTree(4)).rejects.toThrow("Gagal menghapus link tree");
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should send DELETE to the collection", async () => {
      const spy = mockResult({ status: "success", message: "Semua dihapus" });

      await expect(linkTreeApi.deleteAllLinkTrees()).resolves.toBe("Semua dihapus");
      expect(spy.mock.calls[0][0]).toMatch(/\/link-trees\/$/);
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
        "Gagal menghapus semua link tree"
      );
    });
  });

  describe("items", () => {
    it("postItem should send POST with title and url", async () => {
      const spy = mockResult({ status: "success", message: "Tautan ditambah" });

      await expect(linkTreeApi.postItem(1, "GitHub", "https://github.com")).resolves.toBe(
        "Tautan ditambah"
      );
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/items");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ title: "GitHub", url: "https://github.com" });
    });

    it("postItem should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.postItem(1, "a", "b")).rejects.toThrow("Gagal menambahkan tautan");
    });

    it("putItem should send PUT to the item endpoint", async () => {
      const spy = mockResult({ status: "success", message: "Tautan diubah" });

      await expect(linkTreeApi.putItem(1, 7, "GitLab", "https://gitlab.com")).resolves.toBe(
        "Tautan diubah"
      );
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/items/7");
      expect(options.method).toBe("PUT");
    });

    it("putItem should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.putItem(1, 7, "a", "b")).rejects.toThrow("Gagal mengubah tautan");
    });

    it("deleteItem should send DELETE to the item endpoint", async () => {
      const spy = mockResult({ status: "success", message: "Tautan dihapus" });

      await expect(linkTreeApi.deleteItem(1, 7)).resolves.toBe("Tautan dihapus");
      expect(spy.mock.calls[0][0]).toContain("/link-trees/1/items/7");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
    });

    it("deleteItem should throw fallback error on failure", async () => {
      mockResult({ status: "fail" });
      await expect(linkTreeApi.deleteItem(1, 7)).rejects.toThrow("Gagal menghapus tautan");
    });
  });
});
