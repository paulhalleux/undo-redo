import { useStore } from "zustand/react";
import { useShallow } from "zustand/react/shallow";

import { HistoryManager, HistoryState } from "../core/history-manager.ts";

export type HistorySelector<T, S> = (args: {
  state: HistoryState<T>;
  manager: HistoryManager<T>;
}) => S;

export function useHistorySelector<T, S>(
  manager: HistoryManager<T>,
  selector: HistorySelector<T, S>,
): S {
  return useStore(
    manager.store,
    useShallow((state) => selector({ state, manager })),
  );
}

export function useHistory<T>(manager: HistoryManager<T>) {
  return {
    canUndo: useHistorySelector(manager, ({ manager }) => manager.canUndo()),
    canRedo: useHistorySelector(manager, ({ manager }) => manager.canRedo()),
    current: useHistorySelector(manager, ({ manager }) => manager.getCurrent()),
    cursor: useHistorySelector(manager, ({ manager }) => manager.getCursor()),
    history: useHistorySelector(manager, ({ manager }) => manager.getHistory()),
    undo: useHistorySelector(manager, ({ manager }) => manager.undo),
    redo: useHistorySelector(manager, ({ manager }) => manager.redo),
  };
}