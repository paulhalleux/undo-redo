import { castDraft, produce } from "immer";
import { create } from "zustand";

import { StoreUpdater } from "../types/store-utils.ts";

export type HistoryStoreApi<Item> = {
  getState: () => HistoryState<Item>;
  setState: (
    state:
      | HistoryState<Item>
      | ((state: HistoryState<Item>) => HistoryState<Item>),
  ) => void;
};

export type HistoryState<Item> = {
  history: Item[];
  cursor: number;
};

export type HistoryManagerOptions<Item> = {
  maxHistoryLength: number;
  store?: HistoryStoreApi<Item>;
};

/**
 * HistoryManager
 * ---
 * A manager for managing history
 * @template Item The type of the items in the history
 */
export class HistoryManager<Item> {
  private _store: HistoryStoreApi<Item>;
  private _options: HistoryManagerOptions<Item>;

  constructor(options: HistoryManagerOptions<Item>) {
    this._store = options.store ?? createHistoryStore<Item>();
    this._options = options;
  }

  /**
   * Push a new item to the history
   *
   * This will add the item to the history and move the cursor to the end.
   * - If the cursor is not at the end of the history, it will remove all the items after the cursor.
   * - If the history length exceeds the maximum history length, it will remove the oldest item.
   *
   * @param item The item to push
   * @returns The item that was pushed
   */
  push(item: Item) {
    this.updateStore((state) => {
      state.history = state.history.slice(0, state.cursor + 1);
      state.history.push(castDraft(item));

      if (state.history.length > this._options.maxHistoryLength) {
        state.history.shift();
      }

      state.cursor = state.history.length - 1;
    });

    return item;
  }

  /**
   * Undo the last item in the history
   *
   * This will move the cursor to the previous item in the history.
   * - If there are no items to undo, it will return `null`.
   * - If the cursor is at the beginning of the history, it will return `null`.
   *
   * @returns The item that was undone
   */
  undo() {
    if (this._store.getState().cursor < 0) {
      return null;
    }

    this.updateStore((state) => {
      state.cursor--;
    });

    return (
      this._store.getState().history[this._store.getState().cursor] ?? null
    );
  }

  /**
   * Redo the last undone item in the history
   *
   * This will move the cursor to the next item in the history.
   * - If there are no items to redo, it will return `null`.
   *
   * @returns The item that was redone
   */
  redo() {
    if (
      this._store.getState().cursor >=
      this._store.getState().history.length - 1
    ) {
      return null;
    }

    this.updateStore((state) => {
      state.cursor++;
    });

    return this._store.getState().history[this._store.getState().cursor];
  }

  /**
   * Get the history
   * @returns The history
   */
  getHistory() {
    return this._store.getState().history;
  }

  /**
   * Get the current item in the history
   * @returns The current item
   */
  getCurrent() {
    return this._store.getState().history[this._store.getState().cursor];
  }

  /**
   * Get the cursor position
   * @returns The cursor position
   */
  getCursor() {
    return this._store.getState().cursor;
  }

  /**
   * Check if undo is possible
   * @returns True if undo is possible
   */
  canUndo() {
    return this._store.getState().cursor >= 0;
  }

  /**
   * Check if redo is possible
   * @returns True if redo is possible
   */
  canRedo() {
    return (
      this._store.getState().cursor < this._store.getState().history.length - 1
    );
  }

  /**
   * Get the store for subscribing to the history state
   */
  get store() {
    return this._store;
  }

  /**
   * Update the store using the given updater
   * @param updater The updater function
   * @private
   */
  private updateStore(updater: StoreUpdater<HistoryState<Item>>) {
    this._store.setState(produce(this._store.getState(), updater));
  }
}

/**
 * Create a new history store
 *
 * @template Item The type of the items in the history
 */
function createHistoryStore<Item>() {
  return create<HistoryState<Item>>(() => ({
    history: [],
    cursor: -1,
  }));
}
