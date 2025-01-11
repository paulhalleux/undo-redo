import { beforeEach, describe, expect, it } from "vitest";

import {
  HistoryManager,
  HistoryState,
  HistoryStoreApi,
} from "../../src/core/history-manager";

describe("HistoryManager", () => {
  const maxHistoryLength = 5;

  type TestItem = string;
  let manager: HistoryManager<TestItem>;

  beforeEach(() => {
    manager = new HistoryManager<TestItem>({ maxHistoryLength });
  });

  it("should initialize with an empty history and cursor at -1", () => {
    expect(manager.getHistory()).toEqual([]);
    expect(manager.getCursor()).toBe(-1);
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });

  it("should add items to the history and update the cursor", () => {
    manager.push("item1");
    expect(manager.getHistory()).toEqual(["item1"]);
    expect(manager.getCursor()).toBe(0);

    manager.push("item2");
    expect(manager.getHistory()).toEqual(["item1", "item2"]);
    expect(manager.getCursor()).toBe(1);
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
    expect(manager.getHistory()).toEqual(["item1", "item3"]);
    expect(manager.getCursor()).toBe(1);
    expect(manager.canRedo()).toBe(false);
  });

  it("should undo and move the cursor back", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();

    expect(manager.getCursor()).toBe(0);
    expect(manager.getCurrent()).toBe("item1");
    expect(manager.canUndo()).toBe(true);
    expect(manager.canRedo()).toBe(true);
  });

  it("should return null when undoing with no history", () => {
    expect(manager.undo()).toBeNull();
  });

  it("should redo and move the cursor forward", () => {
    manager.push("item1");
    manager.push("item2");
    manager.undo();
    manager.redo();

    expect(manager.getCursor()).toBe(1);
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

    expect(manager.getCurrent()).toBe("item1");
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

    expect(manager.getHistory()).toEqual(["item1", "item2", "item3"]);
  });

  it("should return the correct cursor position", () => {
    manager.push("item1");
    expect(manager.getCursor()).toBe(0);

    manager.push("item2");
    expect(manager.getCursor()).toBe(1);

    manager.undo();
    expect(manager.getCursor()).toBe(0);

    manager.redo();
    expect(manager.getCursor()).toBe(1);
  });
});

// Custom store mock implementation
function createMockStore(): HistoryStoreApi<{}> {
  let state: HistoryState<{}> = { history: [], cursor: -1 };

  return {
    getState: () => state,
    setState: (newState) => {
      if (typeof newState === "function") {
        state = newState(state);
      } else {
        state = newState;
      }
    },
  };
}

describe("HistoryManager with Custom Store", () => {
  let customStore: HistoryStoreApi<{}>;
  let historyManager: HistoryManager<{}>;

  beforeEach(() => {
    customStore = createMockStore();
    historyManager = new HistoryManager<{}>({
      maxHistoryLength: 3,
      store: customStore,
    });
  });

  it("should initialize with an empty history and cursor at -1", () => {
    expect(historyManager.getHistory()).toEqual([]);
    expect(historyManager.getCursor()).toBe(-1);
  });

  it("should push an item to the history", () => {
    const item = {};
    historyManager.push(item);

    expect(historyManager.getHistory()).toEqual([item]);
    expect(historyManager.getCursor()).toBe(0);
  });

  it("should maintain a maximum history length", () => {
    historyManager.push({});
    historyManager.push({});
    historyManager.push({});
    historyManager.push({});

    expect(historyManager.getHistory().length).toBe(3); // History length should not exceed 3
  });

  it("should update the cursor position when an item is pushed", () => {
    const item1 = {};
    const item2 = {};

    historyManager.push(item1);
    historyManager.push(item2);

    expect(historyManager.getCursor()).toBe(1); // Cursor should be at the last item
  });

  it("should undo the last action", () => {
    const item1 = {};
    const item2 = {};

    historyManager.push(item1);
    historyManager.push(item2);

    const undoneItem = historyManager.undo();

    expect(undoneItem).toBe(item1); // The item that was undone should be the first item
    expect(historyManager.getCursor()).toBe(0); // Cursor should be at the last item
  });

  it("should return null if undo is not possible", () => {
    const undoneItem = historyManager.undo();
    expect(undoneItem).toBeNull(); // No item to undo
  });

  it("should redo the last undone action", () => {
    const item1 = {};
    const item2 = {};

    historyManager.push(item1);
    historyManager.push(item2);
    historyManager.undo(); // Undo the second item

    const redoneItem = historyManager.redo();

    expect(redoneItem).toBe(item2); // The item that was redone should be the second item
    expect(historyManager.getCursor()).toBe(1); // Cursor should be at the last item
  });

  it("should return null if redo is not possible", () => {
    const redoneItem = historyManager.redo();
    expect(redoneItem).toBeNull(); // No item to redo
  });

  it("should handle pushing items after undo", () => {
    const item1 = {};
    const item2 = {};
    const item3 = {};

    historyManager.push(item1);
    historyManager.push(item2);
    historyManager.undo(); // Undo the second item

    historyManager.push(item3); // Push a new item after undo

    expect(historyManager.getHistory()).toEqual([item1, item3]);
    expect(historyManager.getCursor()).toBe(1); // Cursor should be at the last item
  });

  it("should correctly handle the maxHistoryLength", () => {
    historyManager.push({});
    historyManager.push({});
    historyManager.push({});
    historyManager.push({});
    historyManager.push({});

    // Maximum history length is 3, so the first item should be removed
    expect(historyManager.getHistory().length).toBe(3);
  });
});
