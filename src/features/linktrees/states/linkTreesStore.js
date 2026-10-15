import { writable } from "svelte/store";
import linkTreeApi from "../api/linkTreeApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createLinkTreesStore() {
  const initial = {
    linkTrees: [],
    linkTree: null,
    isLinkTree: false,
    isLinkTreeAdd: false,
    isLinkTreeAdded: false,
    isLinkTreeChange: false,
    isLinkTreeChanged: false,
    isLinkTreeChangeCover: false,
    isLinkTreeChangedCover: false,
    isLinkTreeDelete: false,
    isLinkTreeDeleted: false,
    isLinkTreeDeleteAll: false,
    isLinkTreeDeletedAll: false,
    isLinkTreeItem: false,
    isLinkTreeItemDone: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  function patch(values) {
    innerStore.update((s) => ({ ...s, ...values }));
  }

  return {
    subscribe: innerStore.subscribe,
    get linkTrees() { return currentState.linkTrees; },
    get linkTree() { return currentState.linkTree; },
    get isLinkTree() { return currentState.isLinkTree; },
    get isLinkTreeAdd() { return currentState.isLinkTreeAdd; },
    get isLinkTreeAdded() { return currentState.isLinkTreeAdded; },
    get isLinkTreeChange() { return currentState.isLinkTreeChange; },
    get isLinkTreeChanged() { return currentState.isLinkTreeChanged; },
    get isLinkTreeChangeCover() { return currentState.isLinkTreeChangeCover; },
    get isLinkTreeChangedCover() { return currentState.isLinkTreeChangedCover; },
    get isLinkTreeDelete() { return currentState.isLinkTreeDelete; },
    get isLinkTreeDeleted() { return currentState.isLinkTreeDeleted; },
    get isLinkTreeDeleteAll() { return currentState.isLinkTreeDeleteAll; },
    get isLinkTreeDeletedAll() { return currentState.isLinkTreeDeletedAll; },
    get isLinkTreeItem() { return currentState.isLinkTreeItem; },
    get isLinkTreeItemDone() { return currentState.isLinkTreeItemDone; },
    get $state() { return currentState; },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setLinkTrees(linkTrees) { patch({ linkTrees }); },
    setLinkTree(linkTree) { patch({ linkTree }); },
    setIsLinkTree(status) { patch({ isLinkTree: status }); },
    setIsLinkTreeAdd(status) { patch({ isLinkTreeAdd: status }); },
    setIsLinkTreeAdded(status) { patch({ isLinkTreeAdded: status }); },
    setIsLinkTreeChange(status) { patch({ isLinkTreeChange: status }); },
    setIsLinkTreeChanged(status) { patch({ isLinkTreeChanged: status }); },
    setIsLinkTreeChangeCover(status) { patch({ isLinkTreeChangeCover: status }); },
    setIsLinkTreeChangedCover(status) { patch({ isLinkTreeChangedCover: status }); },
    setIsLinkTreeDelete(status) { patch({ isLinkTreeDelete: status }); },
    setIsLinkTreeDeleted(status) { patch({ isLinkTreeDeleted: status }); },
    setIsLinkTreeDeleteAll(status) { patch({ isLinkTreeDeleteAll: status }); },
    setIsLinkTreeDeletedAll(status) { patch({ isLinkTreeDeletedAll: status }); },
    setIsLinkTreeItem(status) { patch({ isLinkTreeItem: status }); },
    setIsLinkTreeItemDone(status) { patch({ isLinkTreeItemDone: status }); },
    async asyncSetLinkTrees() {
      try {
        this.setLinkTrees(await linkTreeApi.getLinkTrees());
      } catch {
        this.setLinkTrees([]);
      }
    },
    async asyncSetLinkTree(linkTreeId) {
      try {
        this.setLinkTree(await linkTreeApi.getLinkTreeById(linkTreeId));
      } catch {
        this.setLinkTree(null);
      } finally {
        this.setIsLinkTree(true);
      }
    },
    async asyncSetIsLinkTreeAdd(title, type, description) {
      try {
        await linkTreeApi.postLinkTree(title, type, description);
        showSuccessDialog("Link tree berhasil ditambahkan!");
        this.setIsLinkTreeAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeAdded(false);
      } finally {
        this.setIsLinkTreeAdd(true);
      }
    },
    async asyncSetIsLinkTreeChange(linkTreeId, title, type, description) {
      try {
        const message = await linkTreeApi.putLinkTree(linkTreeId, title, type, description);
        showSuccessDialog(message || "Link tree berhasil diperbarui!");
        this.setIsLinkTreeChanged(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeChanged(false);
      } finally {
        this.setIsLinkTreeChange(true);
      }
    },
    async asyncSetIsLinkTreeChangeCover(linkTreeId, cover) {
      try {
        const message = await linkTreeApi.postLinkTreeCover(linkTreeId, cover);
        showSuccessDialog(message || "Sampul berhasil diperbarui!");
        this.setIsLinkTreeChangedCover(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeChangedCover(false);
      } finally {
        this.setIsLinkTreeChangeCover(true);
      }
    },
    async asyncSetIsLinkTreeDelete(linkTreeId) {
      try {
        const message = await linkTreeApi.deleteLinkTree(linkTreeId);
        showSuccessDialog(message || "Link tree berhasil dihapus!");
        this.setIsLinkTreeDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeDeleted(false);
      } finally {
        this.setIsLinkTreeDelete(true);
      }
    },
    async asyncSetIsLinkTreeDeleteAll() {
      try {
        const message = await linkTreeApi.deleteAllLinkTrees();
        showSuccessDialog(message || "Semua link tree berhasil dihapus!");
        this.setIsLinkTreeDeletedAll(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeDeletedAll(false);
      } finally {
        this.setIsLinkTreeDeleteAll(true);
      }
    },
    async _mutateItem(action, fallbackMessage) {
      try {
        const message = await action();
        showSuccessDialog(message || fallbackMessage);
        this.setIsLinkTreeItemDone(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeItemDone(false);
      } finally {
        this.setIsLinkTreeItem(true);
      }
    },
    asyncSetIsLinkTreeItemAdd(linkTreeId, title, url) {
      return this._mutateItem(
        () => linkTreeApi.postItem(linkTreeId, title, url),
        "Tautan berhasil ditambahkan!"
      );
    },
    asyncSetIsLinkTreeItemChange(linkTreeId, itemId, title, url) {
      return this._mutateItem(
        () => linkTreeApi.putItem(linkTreeId, itemId, title, url),
        "Tautan berhasil diperbarui!"
      );
    },
    asyncSetIsLinkTreeItemDelete(linkTreeId, itemId) {
      return this._mutateItem(
        () => linkTreeApi.deleteItem(linkTreeId, itemId),
        "Tautan berhasil dihapus!"
      );
    },
  };
}

export const linkTreesStore = createLinkTreesStore();
export const useLinkTreesStore = () => linkTreesStore;
export default linkTreesStore;
