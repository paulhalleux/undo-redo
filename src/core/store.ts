import { create } from "zustand";

import { HistoryState, HistoryStoreApi } from "./history-manager.ts";

/**
 * Create a new history store
 *
 * @template Item The type of the items in the history
 */
export function createZustandHistoryStore<Item>(): HistoryStoreApi<Item> {
  return create<HistoryState<Item>>(() => ({
    history: [],
    cursor: -1,
  }));
}
