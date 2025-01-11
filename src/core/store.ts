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

/**
 * Create a new simple history store
 *
 * @template Item The type of the items in the history
 */
export function createSimpleHistoryStore<Item>(): HistoryStoreApi<Item> {
  const listeners: Array<() => void> = [];
  let state: HistoryState<Item> = { history: [], cursor: -1 };

  return {
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      };
    },
    getState: () => state,
    setState: (newState) => {
      if (typeof newState === "function") {
        state = newState(state);
      } else {
        state = newState;
      }
      listeners.forEach((listener) => listener());
    },
  };
}
