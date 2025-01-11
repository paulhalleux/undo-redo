import { WritableDraft } from "immer";

export type StoreUpdater<TState> = (state: WritableDraft<TState>) => void;
