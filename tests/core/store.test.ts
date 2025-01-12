import { describe, expect, it, vi } from "vitest";

import {
  createSimpleHistoryStore,
  createZustandHistoryStore,
} from "../../src/core";

// Helper types
interface HistoryItem {
  value: string;
}

// Test suite for createZustandHistoryStore
describe("createZustandHistoryStore", () => {
  it("should initialize with an empty history and cursor at -1", () => {
    const store = createZustandHistoryStore<HistoryItem>();
    const state = store.getState();

    expect(state.history).toEqual([]);
    expect(state.cursor).toBe(-1);
  });

  it("should allow setting state via setState", () => {
    const store = createZustandHistoryStore<HistoryItem>();
    store.setState({ history: [{ value: "item1" }], cursor: 0 });

    const state = store.getState();
    expect(state.history).toEqual([{ value: "item1" }]);
    expect(state.cursor).toBe(0);
  });

  it("should support functional updates to state", () => {
    const store = createZustandHistoryStore<HistoryItem>();
    store.setState((prevState) => ({
      ...prevState,
      history: [...prevState.history, { value: "item2" }],
      cursor: prevState.cursor + 1,
    }));

    const state = store.getState();
    expect(state.history).toEqual([{ value: "item2" }]);
    expect(state.cursor).toBe(0);
  });
});

// Test suite for createSimpleHistoryStore
describe("createSimpleHistoryStore", () => {
  it("should initialize with an empty history and cursor at -1", () => {
    const store = createSimpleHistoryStore<HistoryItem>();
    const state = store.getState();

    expect(state.history).toEqual([]);
    expect(state.cursor).toBe(-1);
  });

  it("should allow setting state directly", () => {
    const store = createSimpleHistoryStore<HistoryItem>();
    store.setState({ history: [{ value: "item1" }], cursor: 0 });

    const state = store.getState();
    expect(state.history).toEqual([{ value: "item1" }]);
    expect(state.cursor).toBe(0);
  });

  it("should support functional updates to state", () => {
    const store = createSimpleHistoryStore<HistoryItem>();
    store.setState((prevState) => ({
      ...prevState,
      history: [...prevState.history, { value: "item2" }],
      cursor: prevState.cursor + 1,
    }));

    const state = store.getState();
    expect(state.history).toEqual([{ value: "item2" }]);
    expect(state.cursor).toBe(0);
  });

  it("should call listeners when state changes", () => {
    const store = createSimpleHistoryStore<HistoryItem>();
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);

    store.setState({ history: [{ value: "item1" }], cursor: 0 });
    expect(listener).toHaveBeenCalledTimes(1);

    store.setState({ history: [{ value: "item2" }], cursor: 1 });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.setState({ history: [{ value: "item3" }], cursor: 2 });
    expect(listener).toHaveBeenCalledTimes(2); // No additional calls
  });
});
