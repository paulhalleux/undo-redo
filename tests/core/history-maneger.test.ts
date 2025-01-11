import { beforeEach, describe, expect, it } from "vitest";

import { HistoryManager, HistoryState, HistoryStoreApi } from "../../src/core";

function createMockStore<T>(): HistoryStoreApi<T> {
  const listeners: Array<() => void> = [];
  let state: HistoryState<T> = { history: [], cursor: -1 };

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

describe("HistoryManager", () => {
  const maxHistoryLength = 5;

  type TestItem = string;
  let manager: HistoryManager<TestItem>;

  beforeEach(() => {
    manager = new HistoryManager<TestItem>({
      initialState: "initial", // Set the initial state here
      maxHistoryLength,
      store: createMockStore(),
    });
  });

  it("should initialize with the initial state and cursor at -1", () => {
    expect(manager.getHistory()).toEqual(["initial"]); // History should contain initial state
    expect(manager.getCursor()).toBe(0); // Cursor should be at the initial state (index 0)
    expect(manager.canUndo()).toBe(false); // No history to undo
    expect(manager.canRedo()).toBe(false); // No redo history
  });

  it("should add items to the history and update the cursor", () => {
    manager.push("item1");
    expect(manager.getHistory()).toEqual(["initial", "item1"]);
    expect(manager.getCursor()).toBe(1);

    manager.push("item2");
    expect(manager.getHistory()).toEqual(["initial", "item1", "item2"]);
    expect(manager.getCursor()).toBe(2);
  });

  it("should respect maxHistoryLength when pushing items", () => {
    for (let i = 1; i <= maxHistoryLength + 2; i++) {
      manager.push(`item${i}`);
    }
    expect(manager.getHistory()).toEqual([
      "item3",
      "item4",
      "item5",
      "item6",
      "item7",
    ]);
    expect(manager.getCursor()).toBe(4);
  });

  it("should clear redo history if pushing new items when not at the end", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();

    manager.push("item3");
    expect(manager.getHistory()).toEqual(["initial", "item1", "item3"]);
    expect(manager.getCursor()).toBe(2);
    expect(manager.canRedo()).toBe(false);
  });

  it("should undo and move the cursor back", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();

    expect(manager.getCursor()).toBe(1);
    expect(manager.getCurrent()).toBe("item1");
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(true);
  });

  it("should return null when undoing with no history", () => {
    manager.clear();
    expect(manager.undo()).toBeNull();
  });

  it("should redo and move the cursor forward", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();
    manager.redo();

    expect(manager.getCursor()).toBe(2);
    expect(manager.getCurrent()).toBe("item2");
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(false);
  });

  it("should return null when redoing with no redo history", () => {
    manager.push("item1");
    expect(manager.redo()).toBeNull();
  });

  it("should return the current item correctly", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();

    expect(manager.getCurrent()).toBe("item1"); // After undo, the current item is the initial state
  });

  it("should handle canUndo and canRedo states correctly", () => {
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);

    manager.push("item1");
    manager.push("item2");
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(false);

    manager.undo();
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(true);

    manager.redo();
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(false);
  });

  it("should return the full history", () => {
    manager.push("item1");
    manager.push("item2");
    manager.push("item3");

    expect(manager.getHistory()).toEqual([
      "initial",
      "item1",
      "item2",
      "item3",
    ]);
  });

  it("should return the correct cursor position", () => {
    manager.push("item1");
    expect(manager.getCursor()).toBe(1);

    manager.push("item2");
    expect(manager.getCursor()).toBe(2);

    manager.undo();
    expect(manager.getCursor()).toBe(1);

    manager.redo();
    expect(manager.getCursor()).toBe(2);
  });

  it("should clear the history", () => {
    manager.push("item1");
    manager.push("item2");
    manager.clear();

    expect(manager.getHistory()).toEqual(["initial"]);
    expect(manager.getCursor()).toBe(0); // Cursor should return to the initial state
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });

  it("should reset the history to the initial state", () => {
    manager.push("item1");
    manager.push("item2");
    manager.reset();

    expect(manager.getHistory()).toEqual(["initial"]);
    expect(manager.getCursor()).toBe(0); // Cursor should return to the initial state
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });
});
